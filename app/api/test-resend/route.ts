import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

export const dynamic = "force-dynamic"

/**
 * GET /api/test-resend
 * 
 * Test endpoint to verify Resend is configured correctly
 * Usage: Visit http://localhost:3000/api/test-resend?email=your@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const testEmail = searchParams.get("email")

    if (!testEmail) {
      return NextResponse.json(
        { 
          error: "Please provide an email parameter",
          usage: "Visit /api/test-resend?email=your@email.com"
        },
        { status: 400 }
      )
    }

    // Check if API key is configured
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "RESEND_API_KEY is not configured in .env file",
          check: "Make sure RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB is in your .env file"
        },
        { status: 500 }
      )
    }

    // Initialize Resend
    const resend = new Resend(apiKey)
    const fromEmail = getEmailSender()

    console.log("📧 Testing Resend configuration:")
    console.log("  - API Key exists:", !!apiKey)
    console.log("  - API Key length:", apiKey?.length)
    console.log("  - From email:", fromEmail)
    console.log("  - To email:", testEmail)

    // Try to send a test email
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: testEmail,
        subject: "Test Email from Nexo - Resend Configuration",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #667eea;">✅ Resend is Working!</h1>
            <p>This is a test email to verify that Resend is configured correctly.</p>
            <p>If you received this email, your Resend setup is working properly.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Sent from: ${fromEmail}<br>
              To: ${testEmail}<br>
              Time: ${new Date().toISOString()}
            </p>
          </body>
          </html>
        `,
      })

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        result: result,
        details: {
          from: fromEmail,
          to: testEmail,
          apiKeyConfigured: true,
          apiKeyLength: apiKey.length,
        }
      })
    } catch (sendError: any) {
      console.error("❌ Error sending test email:", sendError)
      return NextResponse.json(
        {
          error: "Failed to send test email",
          details: {
            message: sendError?.message,
            name: sendError?.name,
            response: sendError?.response,
          },
          troubleshooting: [
            "1. Check that RESEND_API_KEY is correct in .env",
            "2. Make sure you restarted the server after adding the API key",
            "3. Verify the API key is valid in Resend dashboard",
            "4. Check that the 'from' email domain is verified in Resend (or use onboarding@resend.dev for testing)"
          ]
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in test-resend:", error)
    return NextResponse.json(
      { error: "Error testing Resend", details: error?.message },
      { status: 500 }
    )
  }
}
