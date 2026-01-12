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

    const { pathId } = await request.json()

    if (!pathId) {
      return NextResponse.json({ error: "pathId es requerido" }, { status: 400 })
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
        { error: "Solo usuarios Starter pueden seleccionar un path" },
        { status: 403 }
      )
    }

    // Verificar que el módulo existe
    const module = await prisma.module.findUnique({
      where: { id: pathId },
    })

    if (!module) {
      return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
    }

    // Actualizar selectedPathId
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { selectedPathId: pathId },
    })

    return NextResponse.json({ success: true, pathId })
  } catch (error: any) {
    console.error("Error selecting path:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}





