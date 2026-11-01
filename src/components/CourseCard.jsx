import { Link } from 'react-router-dom'
import { Cover } from './Media.jsx'
import { useApp } from '../context/AppContext.jsx'
import { formatMinutes, totalMinutes } from '../lib/courses.js'
import { fa, toman } from '../lib/format.js'

export default function CourseCard({ course }) {
  const { addToCart, owned } = useApp()
  const time = formatMinutes(totalMinutes(course.sessions))

  return (
    <article className="card">
      <Cover course={course} />
      <div className="tags">
        <span className="tag">{course.level}</span>
        <span className="tag">{fa(course.sessions.length)} جلسه</span>
        {time && <span className="tag">{time}</span>}
        {!course.published && <span className="tag">پیش‌نویس</span>}
      </div>
      <h3 className="card-title">{course.title}</h3>
      <p className="muted clamp">{course.summary}</p>
      <div className="row card-foot">
        <span className="price">{toman(course.price)}</span>
        <span className="row-actions">
          <Link className="btn btn-outline btn-sm" to={`/courses/${course.id}`}>جزئیات</Link>
          {owned.includes(course.id) ? (
            <span className="owned">ثبت‌نام شده</span>
          ) : (
            <button className="btn btn-sm" onClick={() => addToCart(course.id)}>افزودن به سبد خرید</button>
          )}
        </span>
      </div>
    </article>
  )
}
