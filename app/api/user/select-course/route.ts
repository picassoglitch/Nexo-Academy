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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "courseId es requerido" }, { status: 400 })
    }

    // Verificar que el usuario existe y es starter
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (dbUser.tier !== 1) {
      return NextResponse.json(
        { error: "Solo usuarios Starter pueden seleccionar un curso" },
        { status: 403 }
      )
    }

    // Verificar que el curso existe y es accesible para Starter
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: true,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Verificar que el curso es accesible para Starter
    if (course.requiredTiers) {
      let courseTiers: string[] = []
      if (typeof course.requiredTiers === "string") {
        try {
          courseTiers = JSON.parse(course.requiredTiers)
        } catch {
          // If parsing fails, allow access
        }
      } else if (Array.isArray(course.requiredTiers)) {
        courseTiers = course.requiredTiers
      }

      if (courseTiers.length > 0 && !courseTiers.includes("ALL") && !courseTiers.includes("STARTER")) {
        return NextResponse.json(
          { error: "Este curso no está disponible para usuarios Starter" },
          { status: 403 }
        )
      }
    }

    // Actualizar selectedCourseId usando SQL directo para evitar problemas de caché del cliente
    try {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "selectedCourseId" = ${courseId},
            "selectedPathId" = NULL
        WHERE id = ${dbUser.id}
      `
    } catch (sqlError: any) {
      // Si falla con SQL, intentar con Prisma normal
      console.warn("SQL update failed, trying Prisma update:", sqlError?.message)
      const updateData: any = {
        selectedCourseId: courseId,
      }
      if (dbUser.selectedPathId) {
        updateData.selectedPathId = null
      }
      await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData,
      })
    }

    return NextResponse.json({ success: true, courseId })
  } catch (error: any) {
    console.error("Error selecting course:", error)
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

