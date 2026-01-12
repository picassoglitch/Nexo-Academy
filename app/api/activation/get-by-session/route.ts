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

    // First, try to find order by Stripe session ID
    let order
    try {
      order = await prisma.order.findUnique({
        where: { externalId: sessionId },
      })
    } catch (prismaError: any) {
      console.error("❌ Prisma error finding order:", prismaError)
      console.error("Error details:", JSON.stringify(prismaError, null, 2))
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

    console.log("✅ Order found:", order.id)

    // Now try to find activation code by orderId (more reliable than include)
    let activationCode
    try {
      activationCode = await prisma.activationCode.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      })
    } catch (prismaError: any) {
      console.error("❌ Prisma error finding activation code:", prismaError)
      console.error("Error details:", JSON.stringify(prismaError, null, 2))
      return NextResponse.json(
        { error: "Error al buscar el código de activación", details: prismaError?.message },
        { status: 500 }
      )
    }

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
