import { createClient } from "@supabase/supabase-js"

/**
 * Supabase client with service role key for server-side operations
 * ⚠️ NEVER expose this in client-side code
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = []
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`)
  }

  // Validate URL format
  if (!supabaseUrl.startsWith("https://") && !supabaseUrl.startsWith("http://")) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
  }

  // Validate service role key format (should start with eyJ for JWT)
  if (!serviceRoleKey.startsWith("eyJ")) {
    console.warn("Service role key doesn't look like a JWT token. Verify SUPABASE_SERVICE_ROLE_KEY is correct.")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}





