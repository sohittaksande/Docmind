import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { type NextRequest } from "next/server";

export async function GET(
  // The first argument is the request object.
  // Using NextRequest is good practice for type safety.
  request: NextRequest,
  
  // The second argument must be a single object that contains the params key.
  // We explicitly define the type here.
  context: { params: { kindeAuth: string } }
) {
  // We can safely destructure the kindeAuth parameter from the context object inside the function.
  const { kindeAuth } = context.params;

  // The handleAuth() function from the Kinde-Auth library is designed to return a
  // Promise<Response>, which is the expected return type for a Next.js route handler.
  // We can return it directly.
  return handleAuth(request, kindeAuth);
}
