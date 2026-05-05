"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface UsageInfo {
  used: number;
  remaining: number;
  isPro: boolean;
}

interface GeneratedContent {
  twitter?: string;
  linkedin?: string;
}

export default function Dashboard() {
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [input, setInput] = useState("");
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    twitter: true,
    linkedin: false,
  });
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"twitter" | "linkedin">("twitter");

  // Load usage info on mount
  useEffect(() => {
    fetchUsage();
  }, []);

  // Check for upgrade param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "true") {
      // Use flush to avoid cascading render warning
      setShowUpgradeModal(true);
    }
    if (params.get("success") === "true") {
      fetchUsage();
    }
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {
      // ignore
    }
  }

  async function handleGenerate() {
    if (!input.trim()) {
      setError("Please enter a URL or paste some text.");
      return;
    }

    setLoading(true);
    setError("");
    setContent(null);

    const selectedPlatforms = Object.entries(platforms)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputMode === "text" ? input : undefined,
          url: inputMode === "url" ? input : undefined,
          platforms: selectedPlatforms,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.code === "LIMIT_REACHED") {
        setShowUpgradeModal(true);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setContent(data.results);
      // Update usage display
      fetchUsage();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    try {
      const res = await fetch("/api/create-checkout-session", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Could not start checkout. Please try again.");
    }
  }

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  }

  function renderTweets(text: string) {
    const lines = text.split("\n").filter((l) => l.trim());
    return lines.map((line, i) => {
      const cleanLine = line.replace(/^\d+\/\s*/, "").trim();
      return (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm leading-relaxed"
        >
          {cleanLine}
        </div>
      );
    });
  }

  function renderLinkedIn(text: string) {
    const paragraphs = text.split("\n\n").filter((p) => p.trim());
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-sm leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {p.trim()}
          </p>
        ))}
      </div>
    );
  }

  const hasContent = content && Object.keys(content).length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">RepurposeAI</div>
          <div className="flex items-center gap-4">
            {usage && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {usage.isPro ? (
                  <span className="text-green-600 font-medium">Pro — unlimited</span>
                ) : (
                  <span>
                    <span className="font-medium">{usage.remaining}</span>
                    <span className="text-zinc-400"> / {usage.used + usage.remaining} free generations left today</span>
                  </span>
                )}
              </div>
            )}
            {!usage?.isPro && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="rounded-full bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Upgrade to Pro
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="font-semibold text-lg mb-6">Your Content</h2>

            {/* Input mode toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setInputMode("url"); setInput(""); setContent(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === "url"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Paste URL
              </button>
              <button
                onClick={() => { setInputMode("text"); setInput(""); setContent(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === "text"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Paste Text
              </button>
            </div>

            {inputMode === "url" ? (
              <input
                type="url"
                placeholder="https://yoursite.com/your-blog-post"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            ) : (
              <textarea
                placeholder="Paste your article text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
              />
            )}

            {/* Platform selection */}
            <div className="mt-6">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Generate for:
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "twitter", label: "X (Twitter)" },
                  { key: "linkedin", label: "LinkedIn" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm cursor-pointer transition-all ${
                      platforms[key as keyof typeof platforms]
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={platforms[key as keyof typeof platforms]}
                      onChange={(e) =>
                        setPlatforms((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black rounded-xl py-3 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate Content"
              )}
            </button>

            {error && (
              <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3">
                {error}
              </div>
            )}
          </div>

          {/* Right: Output */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Generated Content</h2>
              {hasContent && (
                <div className="flex gap-1">
                  {content?.twitter && (
                    <button
                      onClick={() => setActiveTab("twitter")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeTab === "twitter"
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      X
                    </button>
                  )}
                  {content?.linkedin && (
                    <button
                      onClick={() => setActiveTab("linkedin")}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeTab === "linkedin"
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      LinkedIn
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Empty state */}
            {!hasContent && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Your generated content will appear here
                </p>
                <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-1">
                  Paste a URL or text and click Generate
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-black dark:border-t-white rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Generating platform-perfect content...
                </p>
                <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-1">
                  Usually takes 10-20 seconds
                </p>
              </div>
            )}

            {/* Twitter output */}
            {hasContent && content?.twitter && activeTab === "twitter" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Twitter/X Thread
                  </p>
                  <button
                    onClick={() => copyToClipboard(content.twitter!, "twitter")}
                    className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copiedItem === "twitter" ? (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy all
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {renderTweets(content.twitter)}
                </div>
              </div>
            )}

            {/* LinkedIn output */}
            {hasContent && content?.linkedin && activeTab === "linkedin" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    LinkedIn Post
                  </p>
                  <button
                    onClick={() => copyToClipboard(content.linkedin!, "linkedin")}
                    className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copiedItem === "linkedin" ? (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                {renderLinkedIn(content.linkedin)}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xl leading-none"
            >
              &times;
            </button>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                You&apos;ve used your {(usage?.used ?? 0) + (usage?.remaining ?? 0)} free generations for today.
                <br />
                Upgrade to Pro for unlimited content generation.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-black dark:bg-white text-white dark:text-black rounded-xl py-3 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Upgrade to Pro — $12/month
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
