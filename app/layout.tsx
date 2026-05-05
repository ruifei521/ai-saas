import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "RepurposeAI — Turn One Article Into a Week's Worth of Content",
  description:
    "Paste your blog post or any article URL. Get platform-perfect Twitter threads, LinkedIn posts, and more — in seconds. No account connections needed.",
  keywords: ["content repurposing", "twitter thread generator", "linkedin post generator", "ai content tool"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
