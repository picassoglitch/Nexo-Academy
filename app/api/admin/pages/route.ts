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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { pageId, content } = await request.json()

    if (!pageId) {
      return NextResponse.json({ error: "pageId es requerido" }, { status: 400 })
    }

    // Upsert page content
    await prisma.quizConfig.upsert({
      where: { key: `page_${pageId}` },
      update: {
        value: content,
        updatedAt: new Date(),
        updatedBy: dbUser.id,
      },
      create: {
        key: `page_${pageId}`,
        value: content,
        updatedBy: dbUser.id,
      },
    })

    return NextResponse.json({ success: true, content })
  } catch (error: any) {
    console.error("Error saving page content:", error)
    return NextResponse.json(
      { error: error.message || "Error al guardar contenido" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const pageId = searchParams.get("pageId")

    if (!pageId) {
      return NextResponse.json({ error: "pageId es requerido" }, { status: 400 })
    }

    const configRecord = await prisma.quizConfig.findUnique({
      where: { key: `page_${pageId}` },
    })

    if (configRecord && configRecord.value) {
      const content = typeof configRecord.value === "string" 
        ? JSON.parse(configRecord.value) 
        : configRecord.value
      return NextResponse.json({ content })
    }

    return NextResponse.json({ content: null })
  } catch (error: any) {
    console.error("Error loading page content:", error)
    return NextResponse.json({ content: null })
  }
}
