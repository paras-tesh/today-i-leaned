import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function Newsletter() {
  const { notify } = useApp()
  const [email, setEmail] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return notify('ایمیل معتبر وارد کنید')
    const { error } = await supabase.from('subscribers').insert({ email: email.trim() })
    // 23505: the address is already on the list, which is fine for the visitor
    if (error && error.code !== '23505') return notify('ثبت ایمیل انجام نشد')
    setEmail('')
    notify('ایمیل شما ثبت شد')
  }

  return (
    <form className="card center" onSubmit={submit}>
      <h2>دریافت خبرها و تخفیف‌ها</h2>
      <input
        className="narrow"
        type="email"
        placeholder="ایمیل شما"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <button className="btn" type="submit">عضویت</button>
      </div>
    </form>
  )
}
