# University Project Hub

Full-stack platform where university students can showcase projects, collaborate, and where admins can moderate and view analytics.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL
- NextAuth (Credentials + Microsoft OAuth)
- Zod for validation

## Getting Started
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Push schema to DB (dev): `npm run prisma:push`
5. Run dev server: `npm run dev`

## Environment Variables
See `.env.example` for all keys: database URL, NextAuth, Microsoft OAuth.

## Structure
See `app/`, `lib/`, `components/`, `prisma/` as scaffolded.

## Notes
- RBAC enforced in server routes (`lib/auth.ts`).
- APIs are protected and validated with Zod.
- This is a scaffold; extend UI and analytics as needed.
# University-Project-Hub-