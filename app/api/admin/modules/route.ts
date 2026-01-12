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
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Content-Type": "application/json" } })
    }

    const { title, description, courseId, order } = await request.json()

    const module = await prisma.module.create({
      data: {
        title,
        description: description || null,
        courseId,
        order: order || 0,
      },
      include: {
        course: true,
        _count: {
          select: { lessons: true },
        },
      },
    })

    return NextResponse.json(module, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error creating module:", error)
    return NextResponse.json(
      { error: "Error al crear el módulo", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

