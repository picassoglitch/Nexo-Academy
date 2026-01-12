import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { createServiceClient } from "@/lib/supabase/service"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const { tier } = await request.json()

    if (tier < 0 || tier > 3) {
      return NextResponse.json({ error: "Tier inválido (0-3)" }, { status: 400 })
    }

    // Mapear tier número a enum
    const tierEnumMap: Record<number, "STARTER" | "PRO" | "OPERATOR"> = {
      1: "STARTER",
      2: "PRO",
      3: "OPERATOR",
    }

    const tierEnum = tier > 0 ? tierEnumMap[tier as keyof typeof tierEnumMap] : null

    // Actualizar tier en Prisma
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { tier },
    })

    // Crear o actualizar entitlement correspondiente para mantener compatibilidad
    if (tierEnum) {
      await prisma.entitlement.upsert({
        where: {
          userId_tier: {
            userId: id,
            tier: tierEnum,
          },
        },
        update: {
          active: true,
        },
        create: {
          userId: id,
          tier: tierEnum,
          active: true,
        },
      })
    } else {
      // Si tier es 0 (gratis), desactivar todos los entitlements
      await prisma.entitlement.updateMany({
        where: { userId: id },
        data: { active: false },
      })
    }

    // Actualizar metadata en Supabase Auth (opcional, no crítico)
    try {
      const serviceClient = createServiceClient()
      const { data: supabaseUsers, error: listError } = await serviceClient.auth.admin.listUsers()
      
      if (!listError && supabaseUsers) {
        const supabaseUser = supabaseUsers.users.find((u) => u.email === updatedUser.email)

        if (supabaseUser) {
          const tierNames: Record<number, string> = {
            0: "FREE",
            1: "STARTER",
            2: "PRO",
            3: "OPERATOR",
          }

          const { error: updateError } = await serviceClient.auth.admin.updateUserById(supabaseUser.id, {
            user_metadata: {
              ...supabaseUser.user_metadata,
              tier,
              tier_name: tierNames[tier] || "FREE",
            },
          })

          if (updateError) {
            console.warn("Warning: Could not update Supabase Auth metadata:", updateError)
            // No fallar si solo falla la actualización de metadata
          }
        }
      }
    } catch (supabaseError: any) {
      console.warn("Warning: Supabase Auth update failed (non-critical):", supabaseError)
      // Continuar aunque falle Supabase, ya que Prisma se actualizó correctamente
    }

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error("Error updating user tier:", error)
    return NextResponse.json(
      { error: "Error al actualizar el tier", details: error.message },
      { status: 500 }
    )
  }
}
