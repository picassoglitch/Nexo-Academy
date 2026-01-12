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

    const lesson = await prisma.lesson.findUnique({
      where: { id },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404, headers: { "Content-Type": "application/json" } })
    }

    const allLessons = await prisma.lesson.findMany({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: "asc" },
    })

    const currentIndex = allLessons.findIndex((l) => l.id === id)
    if (currentIndex === -1) {
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404, headers: { "Content-Type": "application/json" } })
    }

    let newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= allLessons.length) {
      return NextResponse.json({ error: "No se puede mover" }, { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const targetLesson = allLessons[newIndex]

    // Swap orders
    await prisma.lesson.update({
      where: { id },
      data: { order: targetLesson.order },
    })

    await prisma.lesson.update({
      where: { id: targetLesson.id },
      data: { order: lesson.order },
    })

    return NextResponse.json({ success: true }, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error reordering lesson:", error)
    return NextResponse.json(
      { error: "Error al reordenar la lección", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

