import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CourseCard from '../components/CourseCard.jsx'
import SearchBox from '../components/SearchBox.jsx'
import { useApp } from '../context/AppContext.jsx'
import { levels } from '../lib/courses.js'

const allLevels = ['همه', ...levels]

export default function Courses() {
  const { courses } = useApp()
  const [params, setParams] = useSearchParams()
  const [level, setLevel] = useState('همه')
  const query = params.get('q') || ''

  const list = courses.filter((course) => {
    const text = [course.title, course.summary, ...course.sessions.map((s) => s.title)].join(' ')
    return (level === 'همه' || course.level === level) && text.includes(query)
  })

  return (
    <main className="wrap">
      <section>
        <h2>دوره‌ها</h2>
        <SearchBox key={query} initial={query} onSearch={(q) => setParams(q ? { q } : {})} />
        <div className="filters">
          {allLevels.map((l) => (
            <button key={l} className={level === l ? 'active' : ''} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
        {list.length === 0 && <p className="muted">دوره‌ای پیدا نشد.</p>}
        <div className="grid">
          {list.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
    </main>
  )
}
