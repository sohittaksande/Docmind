import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: Request,
  context: { params: { kindeAuth: string } }
) {
  // Destructure the params from the context object inside the function body
  const { kindeAuth } = context.params;

  // The handleAuth function returns a Promise<Response>, which is what Next.js expects.
  return handleAuth(request, kindeAuth);
}