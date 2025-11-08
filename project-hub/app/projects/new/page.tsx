"use client"
import { useState } from 'react'
import { projectSchema } from '@/lib/validation'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', status: 'IDEATION', visibility: 'PUBLIC', techStack: '', teamSlots: 3 })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean), images: [] as string[] }
    const parsed = projectSchema.safeParse(payload)
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Invalid input')
    setLoading(true)
    const res = await fetch('/api/projects', { method: 'POST', body: JSON.stringify(parsed.data) })
    setLoading(false)
    if (!res.ok) return setError('Failed to create project')
    router.push('/dashboard/student')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Project</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="w-full border p-2 rounded h-40" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <select className="border p-2 rounded" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>IDEATION</option>
            <option>IN_PROGRESS</option>
            <option>COMPLETED</option>
            <option>SEEKING_TEAM</option>
          </select>
          <select className="border p-2 rounded" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
            <option>PUBLIC</option>
            <option>DRAFT</option>
          </select>
          <input className="border p-2 rounded w-24" type="number" min={1} max={20} value={form.teamSlots} onChange={(e) => setForm({ ...form, teamSlots: Number(e.target.value) })} />
        </div>
        <input className="w-full border p-2 rounded" placeholder="Tech stack (comma separated)" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="bg-black text-white py-2 px-4 rounded">{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}


