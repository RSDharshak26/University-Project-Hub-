import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

    // Force role to STUDENT for public registrations to prevent privilege escalation.
    const safeRole = role === 'ADMIN' ? 'STUDENT' : (role ?? 'STUDENT')

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: safeRole,
      },
    })

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 })
  } catch (err) {
    console.error('register error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
