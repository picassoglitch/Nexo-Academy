import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isValidActivationCodeFormat } from "@/lib/activation-code"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Código de activación requerido" },
        { status: 400 }
      )
    }

    // Validate code format
    if (!isValidActivationCodeFormat(code)) {
      return NextResponse.json({
        valid: false,
        error: "Formato de código inválido. El código debe tener el formato: NEXO-XXXX-XXXX",
      })
    }

    // Find activation code
    const activationCode = await prisma.activationCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!activationCode) {
      return NextResponse.json({
        valid: false,
        error: "Código de activación no encontrado",
      })
    }

    // Check if code is expired
    if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
      return NextResponse.json({
        valid: false,
        error: "Este código de activación ha expirado",
      })
    }

    const tierName = activationCode.tier === 1 ? "STARTER" : activationCode.tier === 2 ? "PRO" : activationCode.tier === 3 ? "OPERATOR" : "FREE"

    return NextResponse.json({
      valid: true,
      tier: activationCode.tier,
      tierName,
      useCount: activationCode.useCount,
    })
  } catch (error: any) {
    console.error("Error validating activation code:", error)
    return NextResponse.json(
      { valid: false, error: "Error al validar el código", details: error?.message },
      { status: 500 }
    )
  }
}
