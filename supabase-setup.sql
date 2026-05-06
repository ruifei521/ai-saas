-- Run this in Supabase SQL Editor
-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  "emailVerified" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Accounts table (for NextAuth OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  scope TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Verification tokens
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  UNIQUE(identifier, token)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "stripeCustomerId" TEXT UNIQUE,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId" TEXT,
  "stripeCurrentPeriodEnd" TIMESTAMP,
  "isPro" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Usage table
CREATE TABLE IF NOT EXISTS "Usage" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE("userId", date)
);

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Usage" ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for development)
CREATE POLICY "Allow all on User" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on Account" ON "Account" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on Session" ON "Session" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on VerificationToken" ON "VerificationToken" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on Subscription" ON "Subscription" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on Usage" ON "Usage" FOR ALL USING (true) WITH CHECK (true);