import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { createServiceClient } from "@/lib/supabase/service"

export async function DELETE(request: NextRequest) {
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

    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de IDs de usuarios" }, { status: 400 })
    }

    // Don't allow deleting yourself
    if (userIds.includes(dbUser.id)) {
      return NextResponse.json({ error: "No puedes borrarte a ti mismo" }, { status: 400 })
    }

    // Get users to delete
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, supabaseId: true },
    })

    // Delete from Supabase Auth
    const supabaseService = createServiceClient()
    for (const userToDelete of usersToDelete) {
      if (userToDelete.supabaseId) {
        try {
          await supabaseService.auth.admin.deleteUser(userToDelete.supabaseId)
        } catch (supabaseError) {
          console.error(`Error deleting user ${userToDelete.id} from Supabase:`, supabaseError)
          // Continue with Prisma deletion even if Supabase fails
        }
      }
    }

    // Delete from Prisma
    const result = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} usuario(s) borrado(s) exitosamente`,
      deletedCount: result.count,
    })
  } catch (error: any) {
    console.error("Error deleting users:", error)
    return NextResponse.json(
      { error: "Error al borrar usuarios", message: error?.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { userIds, tier } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de IDs de usuarios" }, { status: 400 })
    }

    if (tier === undefined || tier < 0 || tier > 3) {
      return NextResponse.json({ error: "Tier inválido (0-3)" }, { status: 400 })
    }

    // Mapear tier número a enum
    const tierEnumMap: Record<number, "STARTER" | "PRO" | "OPERATOR"> = {
      1: "STARTER",
      2: "PRO",
      3: "OPERATOR",
    }

    const tierEnum = tier > 0 ? tierEnumMap[tier as keyof typeof tierEnumMap] : null

    // Update tiers in Prisma
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { tier },
    })

    // Update entitlements
    if (tierEnum) {
      // Activate entitlements for selected users
      for (const userId of userIds) {
        await prisma.entitlement.upsert({
          where: {
            userId_tier: {
              userId,
              tier: tierEnum,
            },
          },
          update: {
            active: true,
          },
          create: {
            userId,
            tier: tierEnum,
            active: true,
          },
        })
      }
    } else {
      // Deactivate all entitlements for tier 0
      await prisma.entitlement.updateMany({
        where: { userId: { in: userIds } },
        data: { active: false },
      })
    }

    // Update Supabase metadata (non-blocking)
    try {
      const supabaseService = createServiceClient()
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { supabaseId: true },
      })

      for (const user of users) {
        if (user.supabaseId) {
          try {
            await supabaseService.auth.admin.updateUserById(user.supabaseId, {
              user_metadata: {
                tier,
                tier_name: tier === 0 ? "FREE" : tierEnum || "STARTER",
              },
            })
          } catch (supabaseError) {
            console.error(`Error updating Supabase metadata for user ${user.supabaseId}:`, supabaseError)
          }
        }
      }
    } catch (supabaseError) {
      console.error("Error updating Supabase metadata:", supabaseError)
      // Non-critical, continue
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} usuario(s) actualizado(s) exitosamente`,
      updatedCount: result.count,
    })
  } catch (error: any) {
    console.error("Error updating users:", error)
    return NextResponse.json(
      { error: "Error al actualizar usuarios", message: error?.message },
      { status: 500 }
    )
  }
}


