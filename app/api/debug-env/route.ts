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

  // Test 2: Auth config values (partial, safe to expose)
  results.GITHUB_ID = process.env.GITHUB_ID ? "SET(len=" + process.env.GITHUB_ID.length + ")" : "MISSING";
  results.GITHUB_SECRET = process.env.GITHUB_SECRET ? "SET(len=" + process.env.GITHUB_SECRET.length + ")" : "MISSING";
  results.AUTH_SECRET = process.env.AUTH_SECRET ? "SET(len=" + process.env.AUTH_SECRET.length + ")" : "MISSING";
  results.DATABASE_URL = process.env.DATABASE_URL ? "SET(len=" + process.env.DATABASE_URL.length + ")" : "MISSING";

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
