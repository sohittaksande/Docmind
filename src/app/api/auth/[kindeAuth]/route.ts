import { NextRequest } from "next/server";
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: NextRequest,
  context: { params: { kindeAuth: string } } // no Promise
) {
  const { kindeAuth } = context.params; // ✅ just destructure
  return handleAuth(request, kindeAuth);
}
