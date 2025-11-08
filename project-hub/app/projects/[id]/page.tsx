export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, include: { owner: true } })
  if (!project) return <div className="p-6">Not found</div>
  const comments = await prisma.comment.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'asc' }, include: { author: true } })
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{project.title}</h1>
        <div className="text-sm text-gray-600">by {project.owner.name}</div>
        <p className="mt-4 whitespace-pre-wrap">{project.description}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border rounded p-3">
              <div className="text-sm text-gray-600">{c.author.name}</div>
              <div>{c.content}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


