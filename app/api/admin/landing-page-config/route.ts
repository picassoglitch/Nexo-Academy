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

    const config = await request.json()

    // Upsert config
    await prisma.quizConfig.upsert({
      where: { key: "landing_page" },
      update: {
        value: config,
        updatedAt: new Date(),
        updatedBy: dbUser.id,
      },
      create: {
        key: "landing_page",
        value: config,
        updatedBy: dbUser.id,
      },
    })

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    console.error("Error saving landing page config:", error)
    return NextResponse.json(
      { error: error.message || "Error al guardar configuración" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const configRecord = await prisma.quizConfig.findUnique({
      where: { key: "landing_page" },
    })

    if (configRecord && configRecord.value) {
      const config = typeof configRecord.value === "string" 
        ? JSON.parse(configRecord.value) 
        : configRecord.value
      return NextResponse.json({ config })
    }

    return NextResponse.json({ config: null })
  } catch (error: any) {
    console.error("Error loading landing page config:", error)
    return NextResponse.json({ config: null })
  }
}
