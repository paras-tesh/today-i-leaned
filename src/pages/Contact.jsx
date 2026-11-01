import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { supabase } from '../lib/supabase.js'

const empty = { name: '', email: '', message: '' }

export default function Contact() {
  const { notify } = useApp()
  const [form, setForm] = useState(empty)
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return notify('نام و پیام را وارد کنید')
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      message: form.message.trim(),
    })
    if (error) return notify('ارسال پیام انجام نشد')
    setForm(empty)
    notify('پیام شما ارسال شد')
  }

  return (
    <main className="wrap">
      <section>
        <h2>تماس با ما</h2>
        <div className="grid">
          <form className="card" onSubmit={submit}>
            <input placeholder="نام" value={form.name} onChange={update('name')} />
            <input placeholder="ایمیل" value={form.email} onChange={update('email')} />
            <textarea rows="4" placeholder="پیام" value={form.message} onChange={update('message')} />
            <button className="btn" type="submit">ارسال</button>
          </form>
          <div className="card">
            <p>
              تلفن: ۰۹۱۲۰۰۰۰۰۰۰<br />
              ایمیل: info@example.com<br />
              اینستاگرام: @razhayeaseman<br />
              تلگرام: @razhayeaseman
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
