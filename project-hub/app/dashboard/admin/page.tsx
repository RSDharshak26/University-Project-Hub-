export const dynamic = 'force-dynamic'
import { auth } from '@/lib/auth'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return <div className="p-6">Forbidden</div>
  }
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin`, { cache: 'no-store' })
  const { data } = await res.json()
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <pre className="bg-gray-50 p-4 rounded border overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}


