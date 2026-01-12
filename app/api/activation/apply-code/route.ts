import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { isValidActivationCodeFormat } from "@/lib/activation-code"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Código de activación requerido" },
        { status: 400 }
      )
    }

    // Validate code format
    if (!isValidActivationCodeFormat(code)) {
      return NextResponse.json(
        { error: "Formato de código inválido. El código debe tener el formato: NEXO-XXXX-XXXX" },
        { status: 400 }
      )
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()

    if (userError || !supabaseUser) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para activar un código" },
        { status: 401 }
      )
    }

    // Find activation code
    const activationCode = await prisma.activationCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { order: true },
    })

    if (!activationCode) {
      return NextResponse.json(
        { error: "Código de activación no encontrado" },
        { status: 404 }
      )
    }

    // Check if code is expired
    if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Este código de activación ha expirado" },
        { status: 400 }
      )
    }

    // Get or create user in Prisma
    let dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || null,
          supabaseId: supabaseUser.id,
          tier: 0, // Will be updated below
        },
      })
    } else {
      // Update Supabase ID if not set
      if (!dbUser.supabaseId) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { supabaseId: supabaseUser.id },
        })
      }
    }

    // Apply tier (use highest tier)
    const currentTier = dbUser.tier || 0
    const codeTier = activationCode.tier
    const newTier = Math.max(currentTier, codeTier)

    if (newTier > currentTier) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { tier: newTier },
      })
    }

    // Update activation code usage (can be used multiple times)
    await prisma.activationCode.update({
      where: { id: activationCode.id },
      data: {
        usedBy: dbUser.id,
        usedAt: new Date(),
        useCount: { increment: 1 },
      },
    })

    // Update Supabase user metadata
    try {
      const { createServiceClient } = await import("@/lib/supabase/service")
      const supabaseAdmin = createServiceClient()
      const tierName = newTier === 1 ? "STARTER" : newTier === 2 ? "PRO" : newTier === 3 ? "OPERATOR" : "FREE"
      
      await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
        user_metadata: {
          ...supabaseUser.user_metadata,
          tier: newTier,
          tier_name: tierName,
          activation_code_used: code,
        },
      })
    } catch (supabaseError) {
      console.warn("Could not update Supabase metadata (non-critical):", supabaseError)
    }

    const tierName = newTier === 1 ? "STARTER" : newTier === 2 ? "PRO" : newTier === 3 ? "OPERATOR" : "FREE"

    return NextResponse.json({
      success: true,
      message: `¡Código activado exitosamente! Tu cuenta ahora tiene acceso a ${tierName}.`,
      tier: newTier,
      tierName,
      codeUsed: true,
    })
  } catch (error: any) {
    console.error("Error applying activation code:", error)
    return NextResponse.json(
      { error: "Error al activar el código", details: error?.message },
      { status: 500 }
    )
  }
}
