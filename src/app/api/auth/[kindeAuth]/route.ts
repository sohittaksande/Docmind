import { NextRequest, NextResponse } from "next/server";
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { kindeAuth: string } } // destructured correctly
) {
  const { kindeAuth } = params;
  const response = await handleAuth(request, kindeAuth);
  
  // handleAuth usually returns a Response object
  return response;
}
