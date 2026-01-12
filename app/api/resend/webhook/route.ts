import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Verify webhook signature from Resend
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret)
    const digest = hmac.update(payload).digest("hex")
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    )
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("resend-signature")

    // Get webhook secret from environment
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.warn("⚠️ RESEND_WEBHOOK_SECRET not configured. Webhook verification disabled.")
      // In development, allow without secret for testing
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Webhook secret not configured" },
          { status: 401 }
        )
      }
    } else if (signature) {
      // Verify signature if secret is configured
      const isValid = verifySignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error("❌ Invalid webhook signature")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    }

    const event = JSON.parse(body)

    console.log("📧 Resend Webhook Event:", event.type)

    // Handle different event types
    switch (event.type) {
      case "email.sent":
        console.log("✅ Email sent:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
          subject: event.data?.subject,
        })
        // You can update database here if needed
        // Example: Mark email as sent in your database
        break

      case "email.delivered":
        console.log("✅ Email delivered:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
        })
        // Email was successfully delivered
        break

      case "email.delivery_delayed":
        console.log("⚠️ Email delivery delayed:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
        })
        // Delivery is delayed, might retry
        break

      case "email.complained":
        console.log("⚠️ Email marked as spam:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
        })
        // User marked email as spam
        // You might want to remove them from your mailing list
        break

      case "email.bounced":
        console.log("❌ Email bounced:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
          bounce_type: event.data?.bounce_type,
        })
        // Email bounced (invalid address, mailbox full, etc.)
        // You might want to mark email as invalid in your database
        break

      case "email.opened":
        console.log("👁️ Email opened:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
        })
        // User opened the email
        // Track engagement metrics
        break

      case "email.clicked":
        console.log("🖱️ Email link clicked:", {
          emailId: event.data?.email_id,
          to: event.data?.to,
          link: event.data?.link,
        })
        // User clicked a link in the email
        // Track which links are most popular
        break

      default:
        console.log("ℹ️ Unknown event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("❌ Error processing Resend webhook:", error)
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    )
  }
}
