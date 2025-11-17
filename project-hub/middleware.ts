import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Only protect dashboard routes
  if (!pathname.startsWith('/dashboard')) return NextResponse.next()

  // Read token (signed JWT) from request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const role = token?.role as string | undefined

  // Not signed in -> redirect to login with callback
  if (!token) {
    const url = req.nextUrl.clone()
    // redirect to the app login page (app/(auth)/login -> /login)
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin-only area
  if (pathname.startsWith('/dashboard/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Student area (allow STUDENT and ADMIN)
  if (pathname.startsWith('/dashboard/student')) {
    if (role !== 'STUDENT' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
