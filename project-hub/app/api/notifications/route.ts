import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notificationReadSchema } from '@/lib/validation'
import { ok, fail } from '@/lib/utils'

export async function GET() {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const userId = (session.user as any).id
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])
  return ok({ items, unread })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const userId = (session.user as any).id
  const parsed = notificationReadSchema.safeParse(await request.json())
  if (!parsed.success) return fail(parsed.error.message, 400)
  const { ids } = parsed.data
  await prisma.notification.updateMany({ where: { id: { in: ids }, userId }, data: { isRead: true } })
  return ok({ updated: ids.length })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user) return fail('UNAUTHORIZED', 401)
  const userId = (session.user as any).id
  await prisma.notification.deleteMany({ where: { userId } })
  return ok({ cleared: true })
}


