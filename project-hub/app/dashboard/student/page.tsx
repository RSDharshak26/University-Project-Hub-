export const dynamic = 'force-dynamic'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function StudentDashboard() {
  const session = await auth()
  if (!session?.user) return <div className="p-6">Please log in</div>
  const userId = (session.user as any).id
  const projects = await prisma.project.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: 'desc' } })
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Projects</h1>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-600">{p.status} • {p.visibility}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}


