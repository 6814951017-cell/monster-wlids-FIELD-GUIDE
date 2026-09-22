import { useState } from 'react'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const isRegistering = mode === 'register'
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (isRegistering && form.password !== form.passwordConfirm) return setMessage('รหัสผ่านไม่ตรงกัน')
    if (isRegistering && form.password.length < 6) return setMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    setLoading(true); setMessage('')
    try {
      const response = await fetch(`/api/${isRegistering ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isRegistering ? { name: form.name, email: form.email, password: form.password } : { email: form.email, password: form.password }) })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.token) onLogin(data.token)
      else if (response.ok) { setMode('login'); setMessage('สมัครสมาชิกเรียบร้อย กรุณาเข้าสู่ระบบ') }
      else setMessage(data.message || (isRegistering ? 'สมัครสมาชิกไม่สำเร็จ' : 'เข้าสู่ระบบไม่สำเร็จ'))
    } catch { setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้') } finally { setLoading(false) }
  }

  const inputClass = 'mt-1.5 w-full border border-stone-300 bg-[#fffdf7] px-3 py-2.5 outline-none transition focus:border-[#e95e31]'
  return <main className="grid min-h-screen place-items-center bg-[#18231d] p-5 text-[#18231d]"><section className="w-full max-w-md border-t-8 border-[#e95e31] bg-[#fffdf7] p-7 shadow-2xl sm:p-9"><p className="text-xs font-bold tracking-[.2em] text-[#e95e31]">HUNTER'S FIELD GUIDE</p><h1 className="mt-4 text-4xl font-black uppercase leading-none">{isRegistering ? 'Join the hunt' : 'Welcome back'}</h1><p className="mt-3 text-sm text-[#6b726b]">{isRegistering ? 'สร้างบัญชีเพื่อเริ่มบันทึกการผจญภัย' : 'เข้าสู่ระบบเพื่อเข้าถึงคู่มือนักล่าของคุณ'}</p><form className="mt-7 space-y-4" onSubmit={submit}>{isRegistering && <label className="block text-sm font-bold">ชื่อ<input className={inputClass} name="name" value={form.name} onChange={update} required /></label>}<label className="block text-sm font-bold">อีเมล<input className={inputClass} name="email" type="email" value={form.email} onChange={update} required /></label><label className="block text-sm font-bold">รหัสผ่าน<input className={inputClass} name="password" type="password" value={form.password} onChange={update} required /></label>{isRegistering && <label className="block text-sm font-bold">ยืนยันรหัสผ่าน<input className={inputClass} name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={update} required /></label>}<button disabled={loading} className="mt-2 w-full bg-[#e95e31] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c94621] disabled:opacity-60">{loading ? 'กำลังดำเนินการ…' : isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button></form>{message && <p className="mt-4 text-sm text-[#c94621]" role="status">{message}</p>}<p className="mt-6 text-center text-sm text-[#6b726b]">{isRegistering ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'} <button type="button" onClick={() => { setMode(isRegistering ? 'login' : 'register'); setMessage('') }} className="font-bold text-[#e95e31] underline">{isRegistering ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button></p></section></main>
}
