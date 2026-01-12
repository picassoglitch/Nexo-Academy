import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id es requerido" },
        { status: 400 }
      )
    }

    console.log("🔍 Looking for activation code for session:", sessionId)

    // Find order by Stripe session ID
    let order
    try {
      order = await prisma.order.findUnique({
        where: { externalId: sessionId },
        include: {
          activationCodes: {
            orderBy: { createdAt: "desc" },
            take: 1, // Get the most recent code
          },
        },
      })
    } catch (prismaError: any) {
      console.error("❌ Prisma error finding order:", prismaError)
      return NextResponse.json(
        { error: "Error al buscar la orden", details: prismaError?.message },
        { status: 500 }
      )
    }

    if (!order) {
      console.log("⚠️ Order not found for session:", sessionId)
      return NextResponse.json(
        { error: "Orden no encontrada. El webhook puede no haber procesado el pago aún." },
        { status: 404 }
      )
    }

    console.log("✅ Order found:", order.id, "Activation codes count:", order.activationCodes.length)

    const activationCode = order.activationCodes[0]

    if (!activationCode) {
      console.log("⚠️ No activation code found for order:", order.id)
      return NextResponse.json(
        { error: "No se encontró código de activación para esta orden" },
        { status: 404 }
      )
    }

    const tierName = activationCode.tier === 1 ? "STARTER" : activationCode.tier === 2 ? "PRO" : activationCode.tier === 3 ? "OPERATOR" : "FREE"

    console.log("✅ Activation code found:", activationCode.code, "for tier:", tierName)

    return NextResponse.json({
      code: activationCode.code,
      tier: activationCode.tier,
      tierName,
      email: activationCode.email,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error getting activation code:", error)
    console.error("Error stack:", error?.stack)
    return NextResponse.json(
      { error: "Error al obtener el código de activación", details: error?.message },
      { status: 500 }
    )
  }
}
