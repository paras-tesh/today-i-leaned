import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { groupByChapter } from '../lib/courses.js'
import { buckets, downloadPrivate } from '../lib/files.js'
import { fa } from '../lib/format.js'

export default function Panel() {
  const { user, isAdmin, accountLoading, signOut, courses, owned, progress, toggleLesson, openMedia, notify } = useApp()
  const navigate = useNavigate()
  const [openId, setOpenId] = useState(null)

  if (accountLoading) return null

  if (!user) {
    return (
      <main className="wrap">
        <section>
          <div className="card">
            برای دیدن دوره‌ها ابتدا وارد شوید. <Link className="link" to="/login">ورود</Link>
          </div>
        </section>
      </main>
    )
  }

  const mine = courses.filter((c) => owned.includes(c.id))

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  const play = (session, kind, path) =>
    openMedia({ title: session.title, kind, bucket: buckets.private, path })

  const downloadPdf = async (session) => {
    if (!(await downloadPrivate(session.pdfPath, `${session.title}.pdf`))) notify('دریافت فایل انجام نشد')
  }

  return (
    <main className="wrap">
      <section>
        <div className="row">
          <h2>سلام {user.name}</h2>
          <button className="btn btn-outline btn-sm" onClick={logout}>خروج</button>
        </div>

        {isAdmin && (
          <div className="card panel-course">
            <Link className="btn" to="/admin">ورود به پنل مدیریت</Link>
          </div>
        )}

        {mine.length === 0 && (
          <div className="card">
            هنوز دوره‌ای ندارید. <Link className="link" to="/courses">مشاهدهٔ دوره‌ها</Link>
          </div>
        )}

        {mine.map((course) => {
          const done = course.sessions.filter((s) => progress[s.id]).length
          const percent = course.sessions.length ? Math.round((done / course.sessions.length) * 100) : 0
          const open = openId === course.id

          return (
            <div className="card panel-course" key={course.id}>
              <div className="row">
                <b>{course.title}</b>
                <span>{fa(percent)}٪</span>
              </div>
              <div className="bar"><i style={{ width: `${percent}%` }} /></div>
              <button className="btn btn-outline btn-sm" onClick={() => setOpenId(open ? null : course.id)}>
                {open ? 'بستن جلسات' : 'مشاهدهٔ جلسات'}
              </button>

              {open && (
                <div className="protected">
                  {groupByChapter(course.sessions).map((group, i) => (
                    <div key={i}>
                      {group.title && <h4 className="chapter">{group.title}</h4>}
                      <ol className="lessons">
                        {group.items.map(({ session, index }) => (
                          <li key={session.id} value={index + 1}>
                            <label>
                              <input
                                type="checkbox"
                                checked={Boolean(progress[session.id])}
                                onChange={() => toggleLesson(session.id)}
                              />
                              <b>{session.title}</b>
                            </label>
                            {session.description && <p className="muted">{session.description}</p>}
                            <div className="chips">
                              {session.videoPath && (
                                <button onClick={() => play(session, 'video', session.videoPath)}>
                                  <Icon name="play" size={16} /> ویدئو
                                </button>
                              )}
                              {session.pdfPath && (
                                <button onClick={() => downloadPdf(session)}>
                                  <Icon name="download" size={16} /> PDF
                                </button>
                              )}
                              {session.audioPath && (
                                <button onClick={() => play(session, 'audio', session.audioPath)}>
                                  <Icon name="headphones" size={16} /> صوت
                                </button>
                              )}
                              {!session.videoPath && !session.pdfPath && !session.audioPath && (
                                <span className="muted">فایلی بارگذاری نشده است.</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}
