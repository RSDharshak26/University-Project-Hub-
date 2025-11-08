import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { commentSchema } from '@/lib/validation'
import { ok, fail } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return fail('Missing projectId', 400)
  const comments = await prisma.comment.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
    include: { author: true },
  })
  return ok(comments)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.message, 400)
  const data = parsed.data
  const created = await prisma.comment.create({
    data: { content: data.content, projectId: data.projectId, parentId: data.parentId, authorId: (session.user as any).id },
  })
  return ok(created, 201)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const { id, content } = await request.json()
  if (!id || !content) return fail('Missing fields', 400)
  const existing = await prisma.comment.findUnique({ where: { id } })
  if (!existing) return fail('Not found', 404)
  const isOwner = existing.authorId === (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isOwner && !isAdmin) return fail('FORBIDDEN', 403)
  const updated = await prisma.comment.update({ where: { id }, data: { content } })
  return ok(updated)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return fail('Missing id', 400)
  const existing = await prisma.comment.findUnique({ where: { id } })
  if (!existing) return fail('Not found', 404)
  const isOwner = existing.authorId === (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isOwner && !isAdmin) return fail('FORBIDDEN', 403)
  await prisma.comment.delete({ where: { id } })
  return ok({ id })
}


