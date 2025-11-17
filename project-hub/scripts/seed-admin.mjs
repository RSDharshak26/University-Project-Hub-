import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your environment')
    process.exit(1)
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: 'Admin', password: hashed, role: 'ADMIN' },
    create: { email, name: 'Admin', password: hashed, role: 'ADMIN' },
  })

  console.log('Admin user ensured with id:', user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
