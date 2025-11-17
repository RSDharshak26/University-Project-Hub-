import NextAuth, { getServerSession, type AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import AzureAd from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
    AzureAd({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub ?? profile.oid ?? profile.id,
          name: profile.name,
          email: profile.email,
          role: 'STUDENT',
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        // When signing in via Azure AD, ensure a corresponding Prisma user exists
        // Use upsert so existing users keep their role and data is not overwritten.
        if (account?.provider === 'azure-ad' && user?.email) {
          await prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name ?? undefined },
            create: {
              email: user.email,
              name: user.name ?? undefined,
              role: 'STUDENT',
            },
          })
        }
      } catch (err) {
        console.error('signIn upsert error', err)
        // allow sign in to proceed; NextAuth will handle errors separately
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role ?? token.role ?? 'STUDENT'
      } else if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = (token as any).role ?? 'STUDENT'
      }
      return session
    },
  },
}

export const auth = () => getServerSession(authOptions)

export function assertRole(userRole: string | undefined, allowed: Array<'ADMIN' | 'STUDENT'>) {
  if (!userRole || !allowed.includes(userRole as any)) {
    throw new Error('FORBIDDEN')
  }
}


