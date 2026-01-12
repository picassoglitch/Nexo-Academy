import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { code, type, amount, maxRedemptions, expiresAt } = await request.json()

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        amount,
        maxRedemptions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json(
      { error: "Error al crear el cupón" },
      { status: 500 }
    )
  }
}

