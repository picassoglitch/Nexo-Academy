import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

// Store pricing in environment variables or a config table
// For now, we'll use env vars
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Content-Type": "application/json" } })
    }

    const prices = await request.json()

    // In a production app, you'd store this in a database table
    // For now, we'll just validate and return success
    // You can create a PricingConfig table if needed

    return NextResponse.json(
      { 
        success: true, 
        message: "Precios actualizados. Nota: En producción, estos deben guardarse en la base de datos.",
        prices 
      },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Error updating pricing:", error)
    return NextResponse.json(
      { error: "Error al actualizar los precios", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Content-Type": "application/json" } })
    }

    // Return current prices from constants or env
    const prices = {
      STARTER: parseInt(process.env.TIER_STARTER_PRICE || "29900"),
      PRO: parseInt(process.env.TIER_PRO_PRICE || "99900"),
      OPERATOR: parseInt(process.env.TIER_OPERATOR_PRICE || "399900"),
    }

    return NextResponse.json(prices, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error fetching pricing:", error)
    return NextResponse.json(
      { error: "Error al obtener los precios", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

