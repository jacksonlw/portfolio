import { profileJson } from '@/lib/machine'

export const dynamic = 'force-static'

export function GET() {
  return Response.json(profileJson())
}
