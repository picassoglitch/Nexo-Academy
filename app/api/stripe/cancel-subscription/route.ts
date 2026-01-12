import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
      apiVersion: "2025-02-24.acacia",
    })
  : null

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: "No se encontró suscripción activa" },
        { status: 404 }
      )
    }

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: dbUser.mpCustomerId,
      status: "active",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "No se encontró suscripción activa" },
        { status: 404 }
      )
    }

    const subscription = subscriptions.data[0]

    // Cancel subscription at period end (recommended) or immediately
    const { cancel_at_period_end } = await request.json()

    if (cancel_at_period_end) {
      // Cancel at period end - user keeps access until period ends
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      })

      return NextResponse.json({
        success: true,
        message: "Tu suscripción se cancelará al final del período actual",
        cancel_at: subscription.current_period_end * 1000, // Convert to milliseconds
      })
    } else {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.id)

      // Update user tier to 0 (free)
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { tier: 0 },
      })

      return NextResponse.json({
        success: true,
        message: "Tu suscripción ha sido cancelada",
      })
    }
  } catch (error: any) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      { error: "Error al cancelar la suscripción", details: error?.message },
      { status: 500 }
    )
  }
}


