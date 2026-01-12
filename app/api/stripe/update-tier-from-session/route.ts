import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
      apiVersion: "2025-02-24.acacia",
    })
  : null

/**
 * Fallback endpoint to update user tier directly from Stripe session
 * This is used when the webhook hasn't processed yet but we need to update the tier
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe no está configurado" },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id es requerido" },
        { status: 400 }
      )
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Sesión de pago no encontrada o no pagada" },
        { status: 404 }
      )
    }

    const metadata = session.metadata || {}
    const userEmail = metadata.user_email || session.customer_email || ""
    const tier = metadata.tier
    const tierNumber = parseInt(metadata.tier_number || "0")

    if (!userEmail || !tier) {
      return NextResponse.json(
        { error: "Email o tier faltante en la sesión" },
        { status: 400 }
      )
    }

    // Get user
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          email: userEmail,
          name: metadata.user_name || null,
          tier: tierNumber,
        },
      })
      console.log(`✅ [Fallback] Created new user with tier ${tierNumber} (${tier}) for:`, userEmail)
    } else {
      // Update tier - only if new tier is higher
      const currentTier = dbUser.tier || 0
      const newTier = Math.max(currentTier, tierNumber)

      if (newTier > currentTier) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { tier: newTier },
        })
        console.log(`✅ [Fallback] Updated user tier from ${currentTier} to ${newTier} (${tier}) for:`, userEmail)
      } else {
        console.log(`ℹ️ [Fallback] User already has tier ${currentTier} (>= ${tierNumber}), keeping current tier for:`, userEmail)
      }
    }

    // Create order if it doesn't exist
    const existingOrder = await prisma.order.findFirst({
      where: {
        externalId: sessionId,
      },
    })

    if (!existingOrder) {
      await prisma.order.create({
        data: {
          userId: dbUser.id,
          externalId: sessionId,
          status: "APPROVED",
          amount: session.amount_total || 0,
          currency: "USD",
        },
      })
      console.log(`✅ [Fallback] Created order for session:`, sessionId)
    }

    return NextResponse.json({
      success: true,
      tier: dbUser.tier,
      tierName: tier,
    })
  } catch (error: any) {
    console.error("Error updating tier from session:", error)
    return NextResponse.json(
      { error: "Error al actualizar el tier", details: error?.message },
      { status: 500 }
    )
  }
}
