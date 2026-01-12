import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

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

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (!dbUser || !dbUser.mpCustomerId) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      })
    }

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: dbUser.mpCustomerId,
      status: "all",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      })
    }

    const subscription = subscriptions.data[0]

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start * 1000,
        current_period_end: subscription.current_period_end * 1000,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
      },
    })
  } catch (error: any) {
    console.error("Error getting subscription:", error)
    return NextResponse.json(
      { error: "Error al obtener la suscripción", details: error?.message },
      { status: 500 }
    )
  }
}


