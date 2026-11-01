import { Link, useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard.jsx'
import Newsletter from '../components/Newsletter.jsx'
import ReviewForm from '../components/ReviewForm.jsx'
import SearchBox from '../components/SearchBox.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Home() {
  const { courses, reviews } = useApp()
  const navigate = useNavigate()
  const approved = reviews.filter((r) => r.status === 'approved')

  const search = (query) => navigate(query ? `/courses?q=${encodeURIComponent(query)}` : '/courses')

  return (
    <main>
      <section className="wrap hero">
        <h1>آموزش آسترولوژی مدرن سبک تروپیکال غربی و فنگ‌شویی</h1>
        <p className="muted">به‌صورت حرفه‌ای و قدم‌به‌قدم، با مریم عبدالهی</p>
        <SearchBox onSearch={search} />
        <Link className="btn" to="/courses">مشاهدهٔ دوره‌ها</Link>{' '}
        <Link className="btn btn-outline" to="/blog">محتوای رایگان</Link>
      </section>

      <section className="wrap">
        <div className="card row">
          <img className="avatar" src="/mark.webp" alt="" />
          <div className="grow">
            <h2>مریم عبدالهی</h2>
            <p>مدرس آسترولوژی غربی و فنگ‌شویی؛ با هدف آموزش ساده و کاربردی برای زندگی روزمره.</p>
            <Link className="btn btn-outline btn-sm" to="/about">بیشتر بدانید</Link>
          </div>
        </div>
      </section>

      <section className="wrap">
        <h2>دوره‌ها</h2>
        <div className="grid">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      <section className="wrap">
        <h2>تجربهٔ هنرجویان</h2>
        {approved.length > 0 && (
          <div className="grid review-grid">
            {approved.map((r) => (
              <blockquote className="card" key={r.id}>
                <p>«{r.text}»</p>
                <b>{r.name}</b>
              </blockquote>
            ))}
          </div>
        )}
        <ReviewForm />
      </section>

      <section className="wrap">
        <Newsletter />
      </section>
    </main>
  )
}
