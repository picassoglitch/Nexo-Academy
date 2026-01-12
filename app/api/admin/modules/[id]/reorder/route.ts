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
    const { direction } = await request.json()

    const module = await prisma.module.findUnique({
      where: { id },
    })

    if (!module) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404, headers: { "Content-Type": "application/json" } })
    }

    const allModules = await prisma.module.findMany({
      where: { courseId: module.courseId },
      orderBy: { order: "asc" },
    })

    const currentIndex = allModules.findIndex((m) => m.id === id)
    if (currentIndex === -1) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404, headers: { "Content-Type": "application/json" } })
    }

    let newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= allModules.length) {
      return NextResponse.json({ error: "No se puede mover" }, { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const targetModule = allModules[newIndex]

    // Swap orders
    await prisma.module.update({
      where: { id },
      data: { order: targetModule.order },
    })

    await prisma.module.update({
      where: { id: targetModule.id },
      data: { order: module.order },
    })

    return NextResponse.json({ success: true }, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error reordering module:", error)
    return NextResponse.json(
      { error: "Error al reordenar el módulo", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

