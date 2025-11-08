export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export default async function ProjectsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const tag = (searchParams.tag as string) || undefined
  const status = (searchParams.status as string) || undefined
  const availability = (searchParams.availability as string) || undefined
  const where: any = { visibility: 'PUBLIC' }
  if (tag) where.techStack = { has: tag }
  if (status) where.status = status
  if (availability === 'open') where.teamSlots = { gt: 0 }
  const projects = await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } })
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <ul className="grid md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <a href={`/projects/${p.id}`} className="font-medium hover:underline">{p.title}</a>
            <div className="text-sm text-gray-600">{p.status}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}


