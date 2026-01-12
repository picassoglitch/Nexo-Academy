import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST(
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: "ADMIN",
      },
    })

    return NextResponse.json(updatedUser, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error promoting user:", error)
    return NextResponse.json(
      { error: "Error al promover usuario", message: error?.message },
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

    // Don't allow demoting yourself
    if (id === dbUser.id) {
      return NextResponse.json({ error: "No puedes degradarte a ti mismo" }, { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: "USER",
      },
    })

    return NextResponse.json(updatedUser, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error demoting user:", error)
    return NextResponse.json(
      { error: "Error al degradar usuario", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}


