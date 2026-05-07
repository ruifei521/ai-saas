import { NextResponse } from "next/server";

export async function GET() {
  const nextauthUrl = process.env.NEXTAUTH_URL || "NOT_SET";
  const authUrl = process.env.AUTH_URL || "NOT_SET";
  
  // Check for hidden characters
  let nextauthUrlChars = [];
  if (nextauthUrl !== "NOT_SET") {
    for (let i = 0; i < nextauthUrl.length; i++) {
      nextauthUrlChars.push(nextauthUrl.charCodeAt(i));
    }
  }
  
  // Try URL parsing
  let urlParseResult = "NOT_TESTED";
  if (nextauthUrl !== "NOT_SET") {
    try {
      const u = new URL(nextauthUrl);
      urlParseResult = "OK: " + u.origin;
    } catch (err) {
      urlParseResult = "ERROR: " + (err instanceof Error ? err.message : String(err));
    }
  }
  
  return NextResponse.json({
    GITHUB_ID_SET: !!process.env.GITHUB_ID,
    GITHUB_SECRET_SET: !!process.env.GITHUB_SECRET,
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: nextauthUrl,
    AUTH_URL: authUrl,
    nextauthUrlChars,
    urlParseResult,
    NODE_ENV: process.env.NODE_ENV || "NOT_SET",
    VERCEL: process.env.VERCEL || "NOT_SET",
  });
}
