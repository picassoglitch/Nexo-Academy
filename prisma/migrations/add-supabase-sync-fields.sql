-- Migration: Add Supabase sync fields to User table
-- Run this migration to add emailConfirmed, emailConfirmedAt, and lastSignInAt fields

-- Add emailConfirmed field (boolean, default false)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- Add emailConfirmedAt field (nullable timestamp)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailConfirmedAt" TIMESTAMP(3);

-- Add lastSignInAt field (nullable timestamp)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSignInAt" TIMESTAMP(3);

-- Create index on emailConfirmed for faster queries
CREATE INDEX IF NOT EXISTS "User_emailConfirmed_idx" ON "User"("emailConfirmed");

-- Create index on lastSignInAt for faster queries
CREATE INDEX IF NOT EXISTS "User_lastSignInAt_idx" ON "User"("lastSignInAt");
