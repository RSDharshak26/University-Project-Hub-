"use client"
import { useState } from 'react'
import { registerSchema } from '@/lib/validation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = registerSchema.safeParse({ name, email, password })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setLoading(true)
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
    setLoading(false)
    if (!res.ok) setMessage('Registration failed')
    else setMessage('Registered, you can now log in')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {message && <p className="text-sm">{message}</p>}
        <button disabled={loading} className="w-full bg-black text-white py-2 rounded">{loading ? 'Submitting...' : 'Register'}</button>
      </form>
    </div>
  )
}


