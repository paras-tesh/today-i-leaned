import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const messages = {
  'Invalid login credentials': 'ایمیل یا رمز اشتباه است',
  'User already registered': 'این ایمیل قبلاً ثبت شده است',
}

export default function Login() {
  const { signIn, signUp, notify, redirectTo, setRedirectTo } = useApp()
  const navigate = useNavigate()
  const [registering, setRegistering] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 6) {
      return notify('ایمیل معتبر و رمز حداقل ۶ کاراکتر وارد کنید')
    }
    setBusy(true)
    try {
      if (registering) {
        const signedIn = await signUp(form.name.trim(), form.email.trim(), form.password)
        if (!signedIn) return notify('ایمیل تأیید برای شما ارسال شد')
      } else {
        await signIn(form.email.trim(), form.password)
      }
      setRedirectTo(null)
      navigate(redirectTo || '/panel')
    } catch (error) {
      notify(messages[error.message] || 'ورود ناموفق بود، دوباره تلاش کنید')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="wrap">
      <section className="narrow">
        <form className="card" onSubmit={submit}>
          <h2>{registering ? 'ثبت‌نام' : 'ورود'}</h2>
          {registering && (
            <input placeholder="نام و نام خانوادگی" value={form.name} onChange={update('name')} />
          )}
          <input type="email" placeholder="ایمیل" value={form.email} onChange={update('email')} />
          <input type="password" placeholder="رمز عبور" value={form.password} onChange={update('password')} />
          <button className="btn block" type="submit" disabled={busy}>
            {registering ? 'ایجاد حساب' : 'ورود'}
          </button>
          <p className="center">
            <button type="button" className="link-btn" onClick={() => setRegistering(!registering)}>
              {registering ? 'حساب دارید؟ وارد شوید' : 'حساب ندارید؟ ثبت‌نام کنید'}
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}
