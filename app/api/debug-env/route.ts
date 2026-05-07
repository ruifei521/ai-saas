import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test 1: DB connection
  try {
    const userCount = await prisma.user.count();
    results.dbTest = "OK";
    results.userCount = userCount;
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    results.dbTest = "FAILED";
    results.dbError = e.message;
  }

  // Test 2: Auth config values (show prefix for verification)
  const mask = (v: string | undefined, n = 4) => v ? `SET(len=${v.length}, starts=${v.substring(0, n)}..., ends=...${v.substring(v.length - 2)})` : "MISSING";
  results.GITHUB_ID = mask(process.env.GITHUB_ID);
  results.GITHUB_SECRET = mask(process.env.GITHUB_SECRET, 6);
  results.AUTH_SECRET = mask(process.env.AUTH_SECRET);
  results.DATABASE_URL = mask(process.env.DATABASE_URL, 12);

  // Test 3: Try importing and calling NextAuth directly
  try {
    // Dynamic import to avoid TS issues
    const authModule = await import("@/auth");
    const handlers = authModule.handlers;
    results.handlersType = typeof handlers;

    // Create a Request for signin/github and call the handler
    const req = new Request("https://ai-saas-two-neon.vercel.app/api/auth/signin/github", {
      headers: {
        "host": "ai-saas-two-neon.vercel.app",
        "x-forwarded-proto": "https",
        "x-forwarded-host": "ai-saas-two-neon.vercel.app",
      }
    });

    const res = await (handlers as any).GET(req);
    results.authResponseStatus = res.status;
    results.authResponseHeaders = Object.fromEntries(res.headers.entries());
    const body = await res.text();
    results.authResponseBody = body.substring(0, 500);
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    results.authTest = "FAILED";
    results.authError = e.message;
    results.authErrorName = e.name;
    results.authStack = e.stack?.substring(0, 1000);
  }

  return NextResponse.json(results);
}
