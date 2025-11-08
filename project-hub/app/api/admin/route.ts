import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') return fail('FORBIDDEN', 403)
  const [totalProjects, byStatus, activeUsers, popularTags] = await Promise.all([
    prisma.project.count(),
    prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.user.count({ where: { updatedAt: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } }),
    prisma.project.findMany({ select: { techStack: true } }),
  ])
  const tagCounts = new Map<string, number>()
  for (const p of popularTags) for (const t of p.techStack) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  const tags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20)
  return ok({ totalProjects, byStatus, activeUsers, popularTags: tags })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') return fail('FORBIDDEN', 403)
  const { userId, action } = await request.json()
  if (!userId || !action) return fail('Missing fields', 400)
  if (action === 'ban') {
    // Soft-ban: downgrade role and anonymize name
    const user = await prisma.user.update({ where: { id: userId }, data: { role: 'STUDENT', name: 'Banned User' } })
    return ok(user)
  }
  if (action === 'promote_admin') {
    const user = await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } })
    return ok(user)
  }
  return fail('Unknown action', 400)
}

