import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/*
 * Saves feedback from the dev labs (?lab=<name>) to docs/<name>-lab/feedback.json, one entry per
 * round, so Claude can read it and design the next round. Development only: the live site 404s.
 */

const fileFor = (lab: string) =>
  join(process.cwd(), 'docs', `${lab}-lab`, 'feedback.json')

function labOf(req: Request) {
  if (process.env.NODE_ENV === 'production') return null
  const lab = new URL(req.url).searchParams.get('lab')
  return lab && /^[a-z-]+$/.test(lab) ? lab : null
}

async function load(lab: string) {
  try {
    return JSON.parse(await readFile(fileFor(lab), 'utf8')) as {
      rounds: Record<string, unknown>
    }
  } catch {
    return { rounds: {} }
  }
}

export async function GET(req: Request) {
  const lab = labOf(req)
  if (!lab) return new Response('Not found', { status: 404 })
  return Response.json(await load(lab))
}

export async function POST(req: Request) {
  const lab = labOf(req)
  if (!lab) return new Response('Not found', { status: 404 })
  const body = (await req.json()) as { round?: number }
  if (typeof body.round !== 'number')
    return Response.json({ error: 'round missing' }, { status: 400 })
  const all = await load(lab)
  all.rounds[String(body.round)] = {
    ...body,
    savedAt: new Date().toISOString()
  }
  const file = fileFor(lab)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, JSON.stringify(all, null, 2) + '\n')
  return Response.json({ file: `docs/${lab}-lab/feedback.json` })
}
