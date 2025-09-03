import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const endpoint = url.pathname.split('/').pop() // grabs [kindeAuth]
  if (!endpoint) {
    return new Response('Missing endpoint', { status: 400 })
  }
  return handleAuth(request, endpoint)
}
