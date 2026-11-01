import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { levels, uid } from '../../lib/courses.js'
import { buckets, extension, removeFolder, uploadFile } from '../../lib/files.js'
import { fa } from '../../lib/format.js'
import { supabase } from '../../lib/supabase.js'

// [type, label, accept, field on the session object, database column]
const fileTypes = [
  ['video', 'ویدئو', 'video/*', 'videoPath', 'video_path'],
  ['pdf', 'PDF', 'application/pdf', 'pdfPath', 'pdf_path'],
  ['audio', 'فایل صوتی', 'audio/*', 'audioPath', 'audio_path'],
]

const toLines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean)

// Throws when a Supabase call failed, otherwise hands back its data.
function unwrap({ data, error }) {
  if (error) throw error
  return data
}

// New sessions get a string id until they are saved and the database assigns a number.
const newSession = (chapter = '') => ({
  id: uid(),
  chapter,
  title: '',
  description: '',
  minutes: '',
  videoPath: null,
  pdfPath: null,
  audioPath: null,
  files: {},
})

function initialForm(course) {
  if (!course) {
    return { title: '', level: levels[0], price: '', summary: '', features: '', published: true, sessions: [newSession()] }
  }
  return {
    title: course.title,
    level: course.level,
    price: String(course.price),
    summary: course.summary,
    features: course.features.join('\n'),
    published: course.published,
    sessions: course.sessions.map((s) => ({ ...s, minutes: String(s.minutes || ''), files: {} })),
  }
}

export default function CourseForm({ course, onDone }) {
  const { refreshCourses, notify } = useApp()
  const [form, setForm] = useState(() => initialForm(course))
  const [banner, setBanner] = useState(null)
  const [teaser, setTeaser] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const setSessions = (sessions) => setForm({ ...form, sessions })

  const patchSession = (index, patch) =>
    setSessions(form.sessions.map((s, i) => (i === index ? { ...s, ...patch } : s)))

  const setSessionFile = (index, type, file) => {
    const files = { ...form.sessions[index].files }
    if (file) files[type] = file
    else delete files[type]
    patchSession(index, { files })
  }

  const moveSession = (index, step) => {
    const sessions = [...form.sessions]
    const target = index + step
    ;[sessions[index], sessions[target]] = [sessions[target], sessions[index]]
    setSessions(sessions)
  }

  const addSession = () => {
    const last = form.sessions[form.sessions.length - 1]
    setSessions([...form.sessions, newSession(last?.chapter)])
  }

  const submit = async (e) => {
    e.preventDefault()
    const price = Number(form.price)
    if (!form.title.trim() || !price || !form.summary.trim()) {
      return notify('عنوان، قیمت و توضیحات دوره را وارد کنید')
    }
    if (form.sessions.some((s) => !s.title.trim())) {
      return notify('برای همهٔ جلسات عنوان وارد کنید')
    }

    setSaving(true)
    try {
      const row = {
        title: form.title.trim(),
        level: form.level,
        price,
        summary: form.summary.trim(),
        features: toLines(form.features),
        published: form.published,
      }

      let courseId = course?.id
      if (courseId) unwrap(await supabase.from('courses').update(row).eq('id', courseId))
      else courseId = unwrap(await supabase.from('courses').insert(row).select('id').single()).id

      const media = {}
      if (banner) {
        const path = `${courseId}/banner-${Date.now()}.${extension(banner)}`
        media.banner_path = await uploadFile(buckets.public, path, banner, course?.bannerPath)
      }
      if (teaser) {
        const path = `${courseId}/teaser-${Date.now()}.${extension(teaser)}`
        media.teaser_path = await uploadFile(buckets.public, path, teaser, course?.teaserPath)
      }
      if (Object.keys(media).length) unwrap(await supabase.from('courses').update(media).eq('id', courseId))

      const kept = form.sessions.filter((s) => typeof s.id === 'number').map((s) => s.id)
      for (const old of course?.sessions ?? []) {
        if (kept.includes(old.id)) continue
        await removeFolder(buckets.private, `${courseId}/${old.id}`)
        unwrap(await supabase.from('sessions').delete().eq('id', old.id))
      }

      for (const [position, session] of form.sessions.entries()) {
        const sessionRow = {
          course_id: courseId,
          position,
          chapter: session.chapter.trim(),
          title: session.title.trim(),
          description: session.description.trim(),
          minutes: Number(session.minutes) || 0,
        }

        let sessionId = session.id
        if (typeof sessionId === 'number') {
          unwrap(await supabase.from('sessions').update(sessionRow).eq('id', sessionId))
        } else {
          sessionId = unwrap(await supabase.from('sessions').insert(sessionRow).select('id').single()).id
        }

        const paths = {}
        for (const [type, , , field, column] of fileTypes) {
          const file = session.files[type]
          if (!file) continue
          const path = `${courseId}/${sessionId}/${type}-${Date.now()}.${extension(file)}`
          paths[column] = await uploadFile(buckets.private, path, file, session[field])
        }
        if (Object.keys(paths).length) unwrap(await supabase.from('sessions').update(paths).eq('id', sessionId))
      }

      await refreshCourses()
      notify(course ? 'تغییرات ذخیره شد' : 'دوره اضافه شد')
      onDone()
    } catch (error) {
      console.error(error)
      notify('ذخیرهٔ دوره انجام نشد؛ اتصال و حجم فایل‌ها را بررسی کنید')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>{course ? 'ویرایش دوره' : 'دورهٔ جدید'}</h3>

      <label className="field">
        عنوان دوره
        <input value={form.title} onChange={update('title')} />
      </label>

      <div className="grid">
        <label className="field">
          قیمت (تومان)
          <input type="number" min="0" value={form.price} onChange={update('price')} />
        </label>
        <label className="field">
          سطح
          <select value={form.level} onChange={update('level')}>
            {levels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        توضیحات دوره
        <textarea rows="4" value={form.summary} onChange={update('summary')} />
      </label>

      <label className="field">
        ویژگی‌های دوره (هر خط یک ویژگی)
        <textarea rows="3" value={form.features} onChange={update('features')} />
      </label>

      <div className="grid">
        <label className="field">
          بنر دوره (تصویر){course?.bannerPath && !banner && <Icon name="check" size={14} />}
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0] || null)} />
        </label>
        <label className="field">
          تیزر دوره (ویدئوی کوتاه){course?.teaserPath && !teaser && <Icon name="check" size={14} />}
          <input type="file" accept="video/*" onChange={(e) => setTeaser(e.target.files[0] || null)} />
        </label>
      </div>
      <p className="muted">اگر تیزر بارگذاری شود، دکمهٔ «مشاهدهٔ تیزر» در صفحهٔ دوره نمایش داده می‌شود.</p>

      <label className="check">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        نمایش در سایت
      </label>

      <h3>جلسات</h3>
      {form.sessions.map((session, i) => (
        <fieldset className="session-form" key={session.id}>
          <div className="row">
            <b>جلسهٔ {fa(i + 1)}</b>
            <span className="row-actions">
              <button type="button" className="icon-btn" aria-label="بالا" disabled={i === 0} onClick={() => moveSession(i, -1)}>
                <Icon name="up" size={18} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="پایین"
                disabled={i === form.sessions.length - 1}
                onClick={() => moveSession(i, 1)}
              >
                <Icon name="down" size={18} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="حذف جلسه"
                onClick={() => setSessions(form.sessions.filter((_, index) => index !== i))}
              >
                <Icon name="trash" size={18} />
              </button>
            </span>
          </div>

          <label className="field">
            فصل (اختیاری)
            <input value={session.chapter} onChange={(e) => patchSession(i, { chapter: e.target.value })} />
          </label>
          <label className="field">
            عنوان جلسه
            <input value={session.title} onChange={(e) => patchSession(i, { title: e.target.value })} />
          </label>
          <label className="field">
            توضیحات جلسه
            <textarea rows="2" value={session.description} onChange={(e) => patchSession(i, { description: e.target.value })} />
          </label>
          <label className="field">
            مدت جلسه (دقیقه)
            <input type="number" min="0" value={session.minutes} onChange={(e) => patchSession(i, { minutes: e.target.value })} />
          </label>

          <div className="grid">
            {fileTypes.map(([type, label, accept, field]) => (
              <label className="field" key={type}>
                {label}
                {(session[field] || session.files[type]) && <Icon name="check" size={14} />}
                <input type="file" accept={accept} onChange={(e) => setSessionFile(i, type, e.target.files[0])} />
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button type="button" className="btn btn-outline btn-sm" onClick={addSession}>
        <Icon name="plus" size={16} /> افزودن جلسه
      </button>

      <div className="form-actions">
        <button className="btn" type="submit" disabled={saving}>{saving ? 'در حال ذخیره…' : 'ذخیره'}</button>
        <button className="btn btn-outline" type="button" onClick={onDone}>انصراف</button>
      </div>
    </form>
  )
}
