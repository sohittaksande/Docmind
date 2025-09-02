import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { kindeAuth: string } }
) {
  // Directly return the result of handleAuth
  // handleAuth() returns a Promise<Response> which is the expected type
  return handleAuth(request, params.kindeAuth);
}