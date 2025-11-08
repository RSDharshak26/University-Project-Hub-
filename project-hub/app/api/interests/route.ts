import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { interestSchema } from '@/lib/validation'
import { ok, fail } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const where: any = {}
  if (projectId) where.projectId = projectId
  const interests = await prisma.interest.findMany({ where, include: { user: true } })
  return ok(interests)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const parsed = interestSchema.safeParse(await request.json())
  if (!parsed.success) return fail(parsed.error.message, 400)
  const { projectId } = parsed.data
  try {
    const created = await prisma.interest.create({ data: { projectId, userId: (session.user as any).id } })
    return ok(created, 201)
  } catch (e) {
    return fail('Already expressed interest or invalid project', 400)
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const { id, status } = await request.json()
  if (!id || !status) return fail('Missing fields', 400)
  // Only project owner or admin can accept/reject
  const interest = await prisma.interest.findUnique({ where: { id }, include: { project: true } })
  if (!interest) return fail('Not found', 404)
  const isOwner = interest.project.ownerId === (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isOwner && !isAdmin) return fail('FORBIDDEN', 403)
  const updated = await prisma.interest.update({ where: { id }, data: { status } })
  return ok(updated)
}


