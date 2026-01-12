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

    // Generate slug from title if title changed
    const existingLesson = await prisma.lesson.findUnique({ 
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!existingLesson) {
      return NextResponse.json({ error: "Lección no encontrada" }, { status: 404, headers: { "Content-Type": "application/json" } })
    }

    const slug = existingLesson.title !== title
      ? title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : existingLesson.slug

    // Handle courseId - find or create module for the course
    let moduleId = existingLesson.moduleId
    if (courseId && courseId !== existingLesson.module.courseId) {
      // Find or create a default module for the new course
      let module = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: "asc" },
      })

      if (!module) {
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

      moduleId = module.id
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        slug,
        summary: summary || null,
        transcriptMd: transcriptMd || null,
        actionChecklistMd: actionChecklistMd || null,
        videoUrl: videoUrl || null,
        moduleId,
        order: order || 0,
        requiredTier: requiredTier || "STARTER",
        isFreePreview: isFreePreview || false,
        lessonType: lessonType !== undefined ? lessonType : existingLesson.lessonType,
        estimatedDuration: estimatedDuration !== undefined ? estimatedDuration : existingLesson.estimatedDuration,
        quizQuestions: quizQuestions !== undefined ? quizQuestions : existingLesson.quizQuestions,
        assignments: assignments !== undefined ? assignments : existingLesson.assignments,
        interactionPoints: interactionPoints !== undefined ? interactionPoints : existingLesson.interactionPoints,
        completionPoints: completionPoints !== undefined ? completionPoints : existingLesson.completionPoints,
        badgeName: badgeName !== undefined ? badgeName : existingLesson.badgeName,
        badgeIcon: badgeIcon !== undefined ? badgeIcon : existingLesson.badgeIcon,
        completionMessage: completionMessage !== undefined ? completionMessage : existingLesson.completionMessage,
        additionalReward: additionalReward !== undefined ? additionalReward : existingLesson.additionalReward,
        prerequisites: prerequisites !== undefined ? prerequisites : existingLesson.prerequisites,
        tags: tags !== undefined ? tags : existingLesson.tags,
        status: status !== undefined ? status : existingLesson.status,
        attachments: attachments !== undefined ? attachments : existingLesson.attachments,
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
    console.error("Error updating lesson:", error)
    return NextResponse.json(
      { error: "Error al actualizar la lección", message: error?.message },
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

    await prisma.lesson.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json(
      { error: "Error al eliminar la lección", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

