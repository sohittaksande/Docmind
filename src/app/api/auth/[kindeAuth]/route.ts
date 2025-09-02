import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// App Router only expects a single argument: the request
export const GET = handleAuth;
export const POST = handleAuth; // if POST is needed
