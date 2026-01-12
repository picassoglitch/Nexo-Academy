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

    const { title, slug, description, published, requiredTiers, imageUrl, coverImageUrl } = await request.json()

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        published: published || false,
        requiredTiers: requiredTiers || ["ALL"],
      },
      include: {
        modules: {
          include: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    })

    return NextResponse.json(course, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: "Error al crear el curso", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

