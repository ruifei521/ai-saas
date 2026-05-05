import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAndIncrementUsage } from "@/lib/usage";
import { generateTwitterThread, generateLinkedInPost, extractArticleFromUrl } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, url, platforms } = await req.json();

  if (!content && !url) {
    return NextResponse.json({ error: "No content or URL provided" }, { status: 400 });
  }

  if (!platforms || platforms.length === 0) {
    return NextResponse.json({ error: "No platform selected" }, { status: 400 });
  }

  // Check usage
  const usageCheck = await checkAndIncrementUsage(session.user.id);
  if (!usageCheck.allowed) {
    return NextResponse.json(
      {
        error: "Daily limit reached",
        code: "LIMIT_REACHED",
        upgradeUrl: "/dashboard?upgrade=true",
      },
      { status: 403 }
    );
  }

  try {
    let articleText = content;

    if (url && !content) {
      articleText = await extractArticleFromUrl(url);
    }

    if (!articleText || articleText.trim().length < 100) {
      return NextResponse.json(
        { error: "Content too short. Please provide at least 100 characters." },
        { status: 400 }
      );
    }

    const results: Record<string, string> = {};

    for (const platform of platforms) {
      if (platform === "twitter" || platform === "x") {
        results.twitter = await generateTwitterThread(articleText);
      } else if (platform === "linkedin") {
        results.linkedin = await generateLinkedInPost(articleText);
      }
    }

    return NextResponse.json({
      results,
      remaining: usageCheck.remaining,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
