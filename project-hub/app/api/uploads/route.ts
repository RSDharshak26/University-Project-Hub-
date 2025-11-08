import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
	const data = await request.formData()
	const file = data.get('file') as File | null
	if (!file) return new Response(JSON.stringify({ error: 'No file' }), { status: 400 })
	const arrayBuffer = await file.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	const uploadsDir = join(process.cwd(), 'public', 'uploads')
	await mkdir(uploadsDir, { recursive: true })
	const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
	const filepath = join(uploadsDir, filename)
	await new Promise<void>((resolve, reject) => {
		const stream = createWriteStream(filepath)
		stream.on('finish', () => resolve())
		stream.on('error', reject)
		stream.end(buffer)
	})
	return Response.json({ url: `/uploads/${filename}` }, { status: 201 })
}
