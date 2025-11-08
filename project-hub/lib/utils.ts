export function ok<T>(data: T, init: number = 200) {
  return Response.json({ data }, { status: init })
}

export function fail(message: string, init: number = 400) {
  return Response.json({ error: message }, { status: init })
}

export function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing env var: ${name}`)
  return val
}


