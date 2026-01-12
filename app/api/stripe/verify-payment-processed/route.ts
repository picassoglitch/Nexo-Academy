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

    // Check if order exists (created by webhook)
    const order = await prisma.order.findFirst({
      where: {
        externalId: sessionId,
        status: "APPROVED",
      },
    })

    return NextResponse.json({
      processed: !!order,
      orderId: order?.id || null,
    })
  } catch (error: any) {
    console.error("Error verifying payment processed:", error)
    return NextResponse.json(
      { error: "Error al verificar el pago", details: error?.message },
      { status: 500 }
    )
  }
}


