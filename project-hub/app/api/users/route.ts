import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation'
import { ok, fail } from '@/lib/utils'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return fail(parsed.error.message, 400)
  const { name, email, password } = parsed.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return fail('Email already in use', 400)
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hash, role: 'STUDENT' } })
  return ok({ id: user.id }, 201)
}


