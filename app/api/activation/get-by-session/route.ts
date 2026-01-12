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

    // Find order by Stripe session ID
    const order = await prisma.order.findUnique({
      where: { externalId: sessionId },
      include: {
        activationCodes: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get the most recent code
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    const activationCode = order.activationCodes[0]

    if (!activationCode) {
      return NextResponse.json(
        { error: "No se encontró código de activación para esta orden" },
        { status: 404 }
      )
    }

    const tierName = activationCode.tier === 1 ? "STARTER" : activationCode.tier === 2 ? "PRO" : activationCode.tier === 3 ? "OPERATOR" : "FREE"

    return NextResponse.json({
      code: activationCode.code,
      tier: activationCode.tier,
      tierName,
      email: activationCode.email,
    })
  } catch (error: any) {
    console.error("Error getting activation code:", error)
    return NextResponse.json(
      { error: "Error al obtener el código de activación", details: error?.message },
      { status: 500 }
    )
  }
}
