import NextAuth, { getServerSession, type AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import AzureAd from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // 1) Email + password
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        // NextAuth’s User type doesn’t know about role, so cast to any
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any
      },
    }),

    // 2) Microsoft / Azure AD
    AzureAd({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',

      // For this school project, let NextAuth link by email to avoid
      // OAuthAccountNotLinked headaches.
      allowDangerousEmailAccountLinking: true,

      authorization: {
        params: { prompt: 'select_account', scope: 'openid profile email' },
      },

      profile(rawProfile) {
        const p = rawProfile as any
        const email: string =
          (p.email as string | undefined) ??
          (p.preferred_username as string | undefined) ??
          ''

        return {
          id: (p.oid as string | undefined) ?? (p.sub as string),
          name: (p.name as string | undefined) ?? '',
          email,
          role: 'STUDENT',
        } as any
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
  },

  debug: process.env.NODE_ENV !== 'production',

  callbacks: {
    // Runs after provider login, before JWT is created
    async signIn({ user, account }: any) {
      try {
        if (!user?.email) return false

        const email = user.email.toLowerCase()

        // 1) Decide if this email is admin
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)

        const isAdmin = adminEmails.includes(email)

        // 2) Upsert user in DB with correct role
        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
          await prisma.user.update({
            where: { email },
            data: {
              name: (user.name as string | null) ?? existing.name,
              // only promote to ADMIN, never randomly demote
              role: isAdmin ? 'ADMIN' : existing.role,
            },
          })
        } else {
          await prisma.user.create({
            data: {
              email,
              name: (user.name as string | null) ?? '',
              role: isAdmin ? 'ADMIN' : 'STUDENT',
            },
          })
        }
      } catch (err) {
        console.error('signIn upsert error', err)
      }

      return true
    },

    // Put role + id into the JWT
    async jwt({ token, user }: any) {
      // Prefer fresh email from user object on first sign-in
      const email: string | undefined =
        (user?.email as string | undefined) ?? (token.email as string | undefined)

      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (dbUser) {
          token.email = dbUser.email
          token.role = dbUser.role
          token.sub = dbUser.id
          return token
        }
      }

      // Fallback if DB user not found yet for some reason
      if (user) {
        token.email = user.email
        token.role = (user as any).role ?? 'STUDENT'
        token.sub = (user as any).id ?? token.sub
      }

      if (!token.role) token.role = 'STUDENT'
      return token
    },

    // Expose id + role on session.user
    async session({ session, token }: any) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).email = token.email
        ;(session.user as any).role = token.role ?? 'STUDENT'
      }
      return session
    },
  },

  events: {
    async signIn(message) {
      console.log(
        '[next-auth][event] signIn',
        message?.user?.email,
        message?.account?.provider,
      )
    },
    async signOut() {
      console.log('[next-auth][event] signOut')
    },
  },
}

export const auth = () => getServerSession(authOptions)

export function assertRole(
  userRole: string | undefined,
  allowed: Array<'ADMIN' | 'STUDENT'>,
) {
  if (!userRole || !allowed.includes(userRole as any)) {
    throw new Error('FORBIDDEN')
  }
}
