import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-bold tracking-tight">RepurposeAI</div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
            Features
          </a>
          <a href="#pricing" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
            Pricing
          </a>
          <Link
            href="/api/auth/signin"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/api/auth/signin"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Now in early access — 3 free generations daily
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Turn One Article Into a
          <br />
          <span className="text-zinc-500 dark:text-zinc-400">Week&apos;s Worth of Content</span>
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your blog post or any article URL. Get platform-perfect Twitter threads,
          LinkedIn posts, and more — in seconds. No account connections needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/api/auth/signin"
            className="rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Start Free — 3 generations daily
          </Link>
          <a
            href="#demo"
            className="rounded-full border border-zinc-200 dark:border-zinc-800 px-8 py-4 text-base font-semibold transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            See how it works
          </a>
        </div>

        <p className="text-sm text-zinc-400 mt-4">No credit card required</p>
      </section>

      {/* Demo */}
      <section id="demo" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-zinc-500 mb-2">How it works</p>
            <h2 className="text-2xl font-bold">Three steps. Two minutes.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">Paste a URL or text</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Any article, blog post, or newsletter. Works with most sites.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">Pick your platforms</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Choose X (Twitter), LinkedIn, or Reddit. Each gets platform-native formatting.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">Copy and post</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                One-click copy for each platform. Post directly — done in 2 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-zinc-500 mb-2">Features</p>
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to repurpose content at scale
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "📝",
              title: "Platform-native formatting",
              desc: "Every post reads like it was written for that platform. Not generic copy-paste.",
            },
            {
              icon: "⚡",
              title: "Instant generation",
              desc: "One article in, multiple platform-ready posts out. Under 30 seconds.",
            },
            {
              icon: "🔗",
              title: "URL or text input",
              desc: "Paste any URL and we extract the content. Or paste text directly.",
            },
            {
              icon: "📋",
              title: "One-click copy",
              desc: "Each post formatted and ready to paste. No reformatting needed.",
            },
            {
              icon: "🎯",
              title: "Hook + thread format",
              desc: "X posts use proven thread format with hooks, numbered tweets, and CTAs.",
            },
            {
              icon: "🔒",
              title: "No account linking",
              desc: "We never ask for your Twitter or LinkedIn passwords. Your data stays yours.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-zinc-500 mb-2">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-4xl font-bold mt-2">$0<span className="text-base font-normal text-zinc-500">/mo</span></p>
            </div>
            <ul className="space-y-3 text-sm mb-8">
              {["3 generations per day", "X (Twitter) threads", "LinkedIn posts", "Copy to clipboard", "Community support"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/api/auth/signin"
              className="block text-center rounded-full border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-black dark:border-white bg-black dark:bg-white p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white dark:bg-black text-xs font-medium px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-white dark:text-black">Pro</h3>
              <p className="text-4xl font-bold mt-2 text-white dark:text-black">$12<span className="text-base font-normal opacity-70">/mo</span></p>
            </div>
            <ul className="space-y-3 text-sm mb-8 text-zinc-300 dark:text-zinc-700">
              {[
                "Unlimited generations",
                "All platforms (X, LinkedIn, Reddit, Instagram)",
                "Priority AI processing",
                "New platforms added regularly",
                "Email support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/api/auth/signin"
              className="block text-center rounded-full bg-white dark:bg-black text-black dark:text-white px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Start 7-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span className="font-semibold">RepurposeAI</span>
          <p>Built with care by an indie maker. &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
