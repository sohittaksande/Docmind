import { NextRequest } from "next/server";
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest) {
  return handleAuth(request);
}
