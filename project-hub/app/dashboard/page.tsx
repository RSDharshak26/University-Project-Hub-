import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardRoot() {
  const session = await auth()

  if (!session?.user) {
    const url = new URL('/login', 'http://example.com')
    url.searchParams.set('callbackUrl', '/dashboard')
    return redirect(url.pathname + url.search)
  }

  const role = (session.user as any).role ?? 'STUDENT'
  if (role === 'ADMIN') return redirect('/dashboard/admin')
  return redirect('/dashboard/student')
}
