import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function ReviewForm() {
  const { user, submitReview, notify } = useApp()
  const [text, setText] = useState('')

  if (!user) {
    return (
      <p className="muted center">
        برای ثبت تجربهٔ خود ابتدا <Link className="link" to="/login">وارد شوید</Link>.
      </p>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    if (text.trim().length < 10) return notify('متن تجربه کمی کوتاه است')
    if (await submitReview(text.trim())) {
      setText('')
      notify('تجربهٔ شما پس از تأیید مدیر نمایش داده می‌شود')
    } else {
      notify('ثبت تجربه انجام نشد')
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>تجربهٔ خود را بنویسید</h3>
      <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn btn-sm" type="submit">ارسال</button>
    </form>
  )
}
