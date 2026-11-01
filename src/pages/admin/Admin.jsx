import { useState } from 'react'
import { Link } from 'react-router-dom'
import CoursesTab from './CoursesTab.jsx'
import ReviewsTab from './ReviewsTab.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { fa } from '../../lib/format.js'

export default function Admin() {
  const { user, isAdmin, accountLoading, reviews } = useApp()
  const [tab, setTab] = useState('courses')

  if (accountLoading) return null

  if (!isAdmin) {
    return (
      <main className="wrap">
        <section>
          <div className="card">
            {user ? (
              'این حساب به پنل مدیریت دسترسی ندارد.'
            ) : (
              <>برای ورود به پنل مدیریت ابتدا <Link className="link" to="/login">وارد شوید</Link>.</>
            )}
          </div>
        </section>
      </main>
    )
  }

  const pending = reviews.filter((r) => r.status === 'pending').length

  return (
    <main className="wrap">
      <section>
        <h2>پنل مدیریت</h2>

        <div className="filters">
          <button className={tab === 'courses' ? 'active' : ''} onClick={() => setTab('courses')}>دوره‌ها</button>
          <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
            تجربه‌های هنرجویان{pending > 0 && ` (${fa(pending)})`}
          </button>
        </div>

        {tab === 'courses' ? <CoursesTab /> : <ReviewsTab />}
      </section>
    </main>
  )
}
