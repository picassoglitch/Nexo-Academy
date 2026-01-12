import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { lessonId, completed } = await request.json()

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: dbUser.id,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: dbUser.id,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json(
      { success: true },
      {
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("Error completing lesson:", error)
    return NextResponse.json(
      { error: "Error al actualizar el progreso", details: error?.message },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

