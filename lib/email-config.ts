/**
 * Unified Email Configuration
 * Free solution using Supabase built-in email + Resend fallback
 */

export const EMAIL_CONFIG = {
  // Sender name - this will appear in the "From" field
  senderName: "Nexo",
  
  // For Resend: Use their default domain (free, no verification needed)
  // Format: "Name <email@domain.com>"
  // Using Resend's default test domain which is free
  resendFrom: "Nexo <onboarding@resend.dev>",
  
  // For production with custom domain (requires Resend domain verification)
  // resendFrom: process.env.RESEND_FROM_EMAIL || "Nexo <noreply@yourdomain.com>",
  
  // Site URL for email links
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
}

/**
 * Get the email sender string
 * Uses environment variable if set, otherwise uses default
 */
export function getEmailSender(): string {
  return process.env.RESEND_FROM_EMAIL || EMAIL_CONFIG.resendFrom
}
