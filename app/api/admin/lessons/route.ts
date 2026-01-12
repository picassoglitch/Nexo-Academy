import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Tier } from "@/lib/types"

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

    const {
      title,
      summary,
      transcriptMd,
      actionChecklistMd,
      videoUrl,
      courseId,
      order,
      requiredTier,
      isFreePreview,
      lessonType,
      estimatedDuration,
      quizQuestions,
      assignments,
      interactionPoints,
      completionPoints,
      badgeName,
      badgeIcon,
      completionMessage,
      additionalReward,
      prerequisites,
      tags,
      status,
      attachments,
    } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "courseId es requerido" }, { status: 400, headers: { "Content-Type": "application/json" } })
    }

    // Find or create a default module for the course
    let module = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: "asc" },
    })

    if (!module) {
      // Create a default module for the course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      })

      if (!course) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404, headers: { "Content-Type": "application/json" } })
      }

      module = await prisma.module.create({
        data: {
          courseId,
          title: "Módulo Principal",
          description: "Módulo principal del curso",
          order: 0,
        },
      })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        summary: summary || null,
        transcriptMd: transcriptMd || null,
        actionChecklistMd: actionChecklistMd || null,
        videoUrl: videoUrl || null,
        moduleId: module.id,
        order: order || 0,
        requiredTier: requiredTier || "STARTER",
        isFreePreview: isFreePreview || false,
        lessonType: lessonType || null,
        estimatedDuration: estimatedDuration || null,
        quizQuestions: quizQuestions || null,
        assignments: assignments || null,
        interactionPoints: interactionPoints || null,
        completionPoints: completionPoints || null,
        badgeName: badgeName || null,
        badgeIcon: badgeIcon || null,
        completionMessage: completionMessage || null,
        additionalReward: additionalReward || null,
        prerequisites: prerequisites || null,
        tags: tags || null,
        status: status || "Borrador",
        attachments: attachments || null,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    return NextResponse.json(lesson, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error creating lesson:", error)
    return NextResponse.json(
      { error: "Error al crear la lección", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

