# University Project Hub

Tech: Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL, NextAuth, Zod

## Setup

1. Create `.env` with at least:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_hub?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-strong-secret"
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID="common"
```

2. Install deps and run:

```
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Auth
- Credentials (email/password) and Microsoft OAuth (Azure AD)
- API: `app/api/auth/route.ts`

## APIs
- Projects CRUD: `app/api/projects/route.ts`
- Comments: `app/api/comments/route.ts`
- Interests: `app/api/interests/route.ts`
- Notifications: `app/api/notifications/route.ts`
- Admin: `app/api/admin/route.ts`
- Registration: `app/api/users/route.ts`

## Lib
- Prisma client: `lib/prisma.ts`
- Auth + RBAC helpers: `lib/auth.ts`
- Validation (Zod): `lib/validation.ts`
- Utils: `lib/utils.ts`

## Pages
- Auth: `app/(auth)/login`, `app/(auth)/register`
- Dashboards: `app/dashboard/student`, `app/dashboard/admin`
- Projects: list, details, new

## Notes
- Run a local PostgreSQL instance or update `DATABASE_URL` accordingly.
- Image uploads are stored under `public/uploads` via `POST /api/uploads` (local dev only).
- Add rate limiting, markdown rendering, mentions, and websockets as enhancements.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
