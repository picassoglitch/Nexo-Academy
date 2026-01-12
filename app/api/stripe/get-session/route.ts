import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { createServiceClient } from "@/lib/supabase/service"
import { TIERS } from "@/lib/constants"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
      apiVersion: "2025-02-24.acacia",
    })
  : null

export async function GET(request: NextRequest) {
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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    })

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Sesión de pago no encontrada o no pagada" },
        { status: 404 }
      )
    }

    const metadata = session.metadata || {}
    const tier = metadata.tier || "STARTER"
    const userEmail = metadata.user_email || session.customer_email || ""
    const userName = metadata.user_name || null

    // Check if user exists first
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    })
    
    // Get tier info - use actual tier from DB if available (webhook may have updated it)
    const tierNumber = parseInt(metadata.tier_number || "0")
    let finalTier = tier
    let finalTierName = ""
    
    // If user exists, check if webhook has updated their tier
    if (dbUser && dbUser.tier !== undefined && dbUser.tier !== null) {
      const actualTier = dbUser.tier
      // Use actual tier from DB if it's different (webhook may have updated it)
      if (actualTier !== tierNumber) {
        console.log(`Using actual tier from DB (${actualTier}) instead of metadata tier (${tierNumber})`)
        const actualTierName = actualTier === 1 ? "STARTER" : actualTier === 2 ? "PRO" : actualTier === 3 ? "OPERATOR" : "FREE"
        finalTier = actualTierName
        const tierInfoActual = TIERS[actualTierName as keyof typeof TIERS]
        finalTierName = tierInfoActual?.name || actualTierName
      }
    }
    
    // If we didn't update from DB, use metadata tier
    if (!finalTierName) {
      const tierInfo = TIERS[finalTier as keyof typeof TIERS]
      finalTierName = tierInfo?.name || finalTier
    }

    // Check if user has Supabase account
    const supabase = createServiceClient()
    let hasSupabaseAccount = false
    let needsAccountCreation = false

    if (dbUser) {
      // User exists in DB, check Supabase
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((u) => u.email === userEmail)
      hasSupabaseAccount = !!existingUser

      if (!hasSupabaseAccount) {
        needsAccountCreation = true
      }
    } else {
      // New user, needs account creation
      needsAccountCreation = true
    }

    return NextResponse.json({
      sessionId: session.id,
      tier: finalTier,
      tierName: finalTierName,
      userEmail,
      userName,
      isExistingUser: !!dbUser,
      hasSupabaseAccount,
      needsAccountCreation,
    })
  } catch (error: any) {
    console.error("Error retrieving Stripe session:", error)
    return NextResponse.json(
      { error: "Error al obtener información de la sesión", details: error?.message },
      { status: 500 }
    )
  }
}

