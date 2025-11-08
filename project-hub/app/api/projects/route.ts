import { auth, assertRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validation'
import { ok, fail } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const availability = searchParams.get('availability') ?? undefined
  const where: any = {
    visibility: 'PUBLIC',
  }
  if (status) where.status = status
  if (tag) where.techStack = { has: tag }
  if (availability === 'open') where.teamSlots = { gt: 0 }
  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { owner: true, _count: { select: { comments: true, interests: true } } },
  })
  return ok(projects)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  assertRole((session.user as any).role, ['STUDENT', 'ADMIN'])
  const body = await request.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.message, 400)
  const data = parsed.data
  const project = await prisma.project.create({
    data: { ...data, ownerId: (session.user as any).id },
  })
  return ok(project, 201)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const { id, ...rest } = await request.json()
  if (!id) return fail('Missing id', 400)
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) return fail('Not found', 404)
  const isOwner = existing.ownerId === (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isOwner && !isAdmin) return fail('FORBIDDEN', 403)
  const parsed = projectSchema.partial().safeParse(rest)
  if (!parsed.success) return fail(parsed.error.message)
  const project = await prisma.project.update({ where: { id }, data: parsed.data })
  return ok(project)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return fail('Missing id', 400)
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) return fail('Not found', 404)
  const isOwner = existing.ownerId === (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isOwner && !isAdmin) return fail('FORBIDDEN', 403)
  await prisma.project.delete({ where: { id } })
  return ok({ id })
}


