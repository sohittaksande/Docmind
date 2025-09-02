import { NextRequest } from "next/server";
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string }> }
) {
  const { kindeAuth } = await context.params; // ✅ await before use
  return handleAuth(request, kindeAuth);
}
