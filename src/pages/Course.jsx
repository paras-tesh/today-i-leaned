import { Link, Navigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { Cover } from '../components/Media.jsx'
import { useApp } from '../context/AppContext.jsx'
import { formatMinutes, groupByChapter, totalMinutes } from '../lib/courses.js'
import { buckets } from '../lib/files.js'
import { fa, toman } from '../lib/format.js'

export default function Course() {
  const { id } = useParams()
  const { courses, coursesLoading, owned, addToCart, openMedia } = useApp()
  const course = courses.find((c) => c.id === Number(id))

  if (coursesLoading) return null
  if (!course) return <Navigate to="/courses" replace />

  const time = formatMinutes(totalMinutes(course.sessions))
  const teaser = () =>
    openMedia({ title: `تیزر: ${course.title}`, kind: 'video', bucket: buckets.public, path: course.teaserPath })

  return (
    <main className="wrap">
      <section>
        <Link className="btn btn-outline btn-sm" to="/courses">بازگشت</Link>
        <div className="course-head">
          <Cover course={course} />
          <h1>{course.title}</h1>
          <p className="muted">
            {course.level} · {fa(course.sessions.length)} جلسه{time && ` · ${time}`}
          </p>
          <p className="summary">{course.summary}</p>
        </div>

        {course.features.length > 0 && (
          <>
            <h3>ویژگی‌های دوره</h3>
            <ul className="features">
              {course.features.map((feature) => (
                <li key={feature}><Icon name="check" size={16} /> {feature}</li>
              ))}
            </ul>
          </>
        )}

        <h3>سرفصل‌ها</h3>
        <div className="card protected">
          {groupByChapter(course.sessions).map((group, i) => (
            <div key={i}>
              {group.title && <h4 className="chapter">{group.title}</h4>}
              <ol className="lessons">
                {group.items.map(({ session, index }) => (
                  <li key={session.id} value={index + 1}>
                    <b>{session.title}</b>
                    {session.minutes > 0 && <span className="muted"> · {fa(session.minutes)} دقیقه</span>}
                    {session.description && <p className="muted">{session.description}</p>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="row buy-row">
          <span className="price">{toman(course.price)}</span>
          <span className="row-actions">
            {course.teaserPath && (
              <button className="btn btn-outline" onClick={teaser}>
                <Icon name="play" size={18} /> مشاهدهٔ تیزر
              </button>
            )}
            {owned.includes(course.id) ? (
              <Link className="btn" to="/panel">ورود به دوره</Link>
            ) : (
              <button className="btn" onClick={() => addToCart(course.id)}>افزودن به سبد خرید</button>
            )}
          </span>
        </div>
      </section>
    </main>
  )
}
