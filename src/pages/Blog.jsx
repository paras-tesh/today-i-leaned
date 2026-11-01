import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Cover } from '../components/Media.jsx'
import { useApp } from '../context/AppContext.jsx'
import { categories, posts } from '../data/posts.js'
import { buckets } from '../lib/files.js'

export default function Blog() {
  const { courses, openMedia } = useApp()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('همه')

  const list = posts.filter(
    (post) => (category === 'همه' || post.category === category) && post.title.includes(query)
  )
  const teasers = courses.filter((course) => course.teaserPath)

  return (
    <main className="wrap">
      <section>
        <h2>وبلاگ و محتوای رایگان</h2>
        <input placeholder="جستجو در مقالات…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="filters">
          {categories.map((c) => (
            <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <div className="grid">
          {list.map((post) => (
            <article className="card" key={post.title}>
              <span className="tag">{post.category}</span>
              <h3>{post.title}</h3>
            </article>
          ))}
        </div>
      </section>

      {teasers.length > 0 && (
        <section>
          <h2>پیش‌نمایش دوره‌ها</h2>
          <div className="grid">
            {teasers.map((course) => (
              <article className="card" key={course.id}>
                <Cover course={course} />
                <h3 className="card-title">{course.title}</h3>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    openMedia({ title: `تیزر: ${course.title}`, kind: 'video', bucket: buckets.public, path: course.teaserPath })
                  }
                >
                  <Icon name="play" size={16} /> مشاهدهٔ تیزر
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
