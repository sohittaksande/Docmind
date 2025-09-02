import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest } from 'next/server'

// The second argument is a context object that contains the dynamic route parameters.
// The most reliable way to type this is with a direct inline type definition.
export async function GET(
  request: NextRequest,
  { params }: { params: { kindeAuth: string } }
) {
  // We can now safely access params.kindeAuth because its type is correctly defined
  // and will be recognized by Next.js's build process.
  const endpoint = params.kindeAuth
  return handleAuth(request, endpoint)
}