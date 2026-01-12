import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Tier } from "@/lib/types"

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
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Content-Type": "application/json" } })
    }

    const { id } = await params
    const { title, description, fileUrl, category, requiredTier } = await request.json()

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        title,
        description: description || null,
        fileUrl,
        category: category || null,
        requiredTier: requiredTier || "STARTER",
      },
    })

    return NextResponse.json(asset, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Error al actualizar el activo", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Error al eliminar el activo", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

