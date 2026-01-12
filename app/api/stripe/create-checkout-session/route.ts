import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { TIERS } from "@/lib/constants"
import { createServiceClient } from "@/lib/supabase/service"
import { detectCurrencyFromRequest } from "@/lib/currency-detection"

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables")
} else {
  // Log first and last few characters for debugging (without exposing full key)
  const key = process.env.STRIPE_SECRET_KEY
  console.log("Stripe key loaded:", key.substring(0, 10) + "..." + key.substring(key.length - 10))
  console.log("Key length:", key.length)
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
      apiVersion: "2025-02-24.acacia",
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error("Stripe is not configured. STRIPE_SECRET_KEY is missing.")
      return NextResponse.json(
        { error: "Stripe no está configurado. Por favor, configura STRIPE_SECRET_KEY en las variables de entorno." },
        { status: 500 }
      )
    }

    // Verify Stripe key format
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || ""
    if (!stripeKey.startsWith("sk_live_") && !stripeKey.startsWith("sk_test_")) {
      console.error("Invalid Stripe key format. Key should start with sk_live_ or sk_test_")
      return NextResponse.json(
        { error: "Formato de clave de Stripe inválido. La clave debe empezar con sk_live_ o sk_test_" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { amount, email, name, tier, couponCode, password } = body

    console.log("=== CREATE CHECKOUT SESSION REQUEST ===")
    console.log("Amount:", amount)
    console.log("Email:", email)
    console.log("Tier:", tier)
    console.log("Name:", name)
    console.log("Coupon Code:", couponCode)
    console.log("========================================")

    if (!amount || !email || !tier) {
      return NextResponse.json(
        { error: "Amount, email y tier son requeridos" },
        { status: 400 }
      )
    }

    // Get user - should already exist (created before payment)
    let dbUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!dbUser) {
      // User should have been created before, but if not, create it
      dbUser = await prisma.user.create({
        data: {
          email,
          name: name || null,
          tier: 0, // Will be updated after payment
        },
      })
    } else {
      // Update name if provided and different
      if (name && dbUser.name !== name) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { name },
        })
      }
    }

    // Verify user has Supabase account (optional - don't block checkout if this fails)
    // This is completely optional - we'll create the account after payment if needed
    try {
      // Only try to verify if Supabase is properly configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createServiceClient()
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
        
        if (listError) {
          console.warn("Could not verify Supabase account (non-critical):", listError.message)
        } else {
          const existingUser = existingUsers?.users?.find((u: any) => u.email === email)
          if (!existingUser) {
            console.warn("User does not have Supabase account. Payment will proceed but account creation may be needed.")
          }
        }
      } else {
        console.warn("Supabase not configured - skipping user verification (non-critical)")
      }
    } catch (supabaseError: any) {
      // Don't block checkout if Supabase verification fails - this is completely optional
      const errorMsg = supabaseError?.message || supabaseError?.toString() || "Unknown error"
      console.warn("Supabase verification failed (non-critical, proceeding with checkout):", errorMsg)
      // Continue with checkout - account will be created after payment if needed
    }

    const tierInfo = TIERS[tier as keyof typeof TIERS]
    if (!tierInfo) {
      return NextResponse.json(
        { error: "Tier inválido" },
        { status: 400 }
      )
    }

    // Get site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // IMPORTANT: All prices are in MXN (base currency)
    // ALWAYS use MXN for Stripe checkout - this is our base currency
    const { isUserFromMexico } = await import("@/lib/currency-detection")
    
    const userIsFromMexico = isUserFromMexico(request)
    
    console.log("User from Mexico:", userIsFromMexico)
    
    // ALWAYS use MXN for Stripe checkout - this is our base currency
    // Stripe will display in MXN for all users
    const finalCurrency = "mxn"
    const finalAmount = amount // Amount is already in MXN centavos
    
    console.log(`Using MXN currency for Stripe checkout: ${finalAmount} centavos (${finalAmount / 100} MXN)`)

    // Handle coupon if provided
    let couponId: string | undefined
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      })
      if (coupon && coupon.active) {
        // Note: Stripe coupons need to be created in Stripe Dashboard
        // For now, we'll apply discount via price_data
        // You can create Stripe coupons and use their IDs here
      }
    }

    // Create Checkout Session - SUBSCRIPTION MODE
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription", // Recurring subscription payments
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn", // ALWAYS use MXN - this is our base currency
            product_data: {
              name: `Nexo - ${tierInfo.name}`,
              description: tierInfo.description,
            },
            unit_amount: finalAmount, // Amount in MXN centavos
            recurring: {
              interval: "month", // Monthly subscription
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      locale: "es-MX", // Use es-MX locale to ensure MXN currency display
      // Force MXN currency for all users (base currency)
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
      metadata: {
        user_id: dbUser.id,
        user_email: email,
        user_name: name || null,
        tier,
        tier_number: tier === "STARTER" ? "1" : tier === "PRO" ? "2" : tier === "OPERATOR" ? "3" : "0",
        coupon_id: couponCode || null,
        // Store password in metadata for account creation after payment confirmation
        account_password: password || null, // Will be used to create account after payment
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?tier=${tier}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || "")}`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Enable automatic tax calculation (Stripe Tax)
      automatic_tax: {
        enabled: true,
      },
    }

    // If user has Stripe customer ID, use it for recurring payments
    if (dbUser.mpCustomerId) {
      // Reuse mpCustomerId field for Stripe customer ID
      sessionParams.customer = dbUser.mpCustomerId
    }

    console.log("Creating Stripe checkout session with params:", {
      mode: sessionParams.mode,
      amount: sessionParams.line_items?.[0]?.price_data?.unit_amount,
      currency: sessionParams.line_items?.[0]?.price_data?.currency,
      email: sessionParams.customer_email,
    })

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log("Checkout session created successfully:", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error("=== ERROR CREATING STRIPE CHECKOUT SESSION ===")
    console.error("Error message:", error?.message)
    console.error("Error type:", error?.type)
    console.error("Error code:", error?.code)
    console.error("Error stack:", error?.stack)
    if (error?.raw) {
      console.error("Raw error:", JSON.stringify(error.raw, null, 2))
    }
    console.error("==============================================")
    
    // Return proper JSON error response
    return NextResponse.json(
      { 
        error: "Error al crear la sesión de pago", 
        details: error?.message || "Error desconocido",
        type: error?.type || "unknown",
        code: error?.code || "unknown",
      },
      { status: 500 }
    )
  }
}

