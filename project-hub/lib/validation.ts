import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const projectSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(1),
  status: z.enum(['IDEATION', 'IN_PROGRESS', 'COMPLETED', 'SEEKING_TEAM']),
  visibility: z.enum(['PUBLIC', 'DRAFT']),
  techStack: z.array(z.string()).default([]),
  teamSlots: z.coerce.number().int().min(1).max(20),
  images: z.array(z.string().url()).default([]),
})

export const commentSchema = z.object({
  content: z.string().min(1).max(8000),
  projectId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
})

export const interestSchema = z.object({
  projectId: z.string().cuid(),
})

export const notificationReadSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
})


