import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Get all quiz configs using raw SQL (more reliable)
    const configs = await prisma.$queryRaw<Array<{ key: string; value: any }>>`
      SELECT key, value FROM "QuizConfig" ORDER BY "updatedAt" DESC
    `

    // Convert to key-value object
    const configObject: Record<string, any> = {}
    configs.forEach((config) => {
      // Parse JSON if it's a string, otherwise use as-is
      configObject[config.key] =
        typeof config.value === "string" ? JSON.parse(config.value) : config.value
    })

    return NextResponse.json(configObject, {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Error fetching quiz config:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración", details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { key, value } = await request.json()

    if (!key || !value) {
      return NextResponse.json({ error: "key y value son requeridos" }, { status: 400 })
    }

    // Upsert config using raw SQL (more reliable)
    // First check if exists
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "QuizConfig" WHERE key = ${key} LIMIT 1
    `

    if (existing.length > 0) {
      // Update
      await prisma.$executeRaw`
        UPDATE "QuizConfig" 
        SET value = ${JSON.stringify(value)}::jsonb, 
            "updatedAt" = NOW(), 
            "updatedBy" = ${dbUser.id}
        WHERE key = ${key}
      `
      const updated = await prisma.$queryRaw<Array<{ id: string; key: string; value: any }>>`
        SELECT id, key, value FROM "QuizConfig" WHERE key = ${key}
      `
      return NextResponse.json(updated[0], {
        headers: { "Content-Type": "application/json" },
      })
    } else {
      // Create
      const newId = crypto.randomUUID()
      await prisma.$executeRaw`
        INSERT INTO "QuizConfig" (id, key, value, "updatedAt", "updatedBy")
        VALUES (${newId}, ${key}, ${JSON.stringify(value)}::jsonb, NOW(), ${dbUser.id})
      `
      const created = await prisma.$queryRaw<Array<{ id: string; key: string; value: any }>>`
        SELECT id, key, value FROM "QuizConfig" WHERE id = ${newId}
      `
      return NextResponse.json(created[0], {
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error: any) {
    console.error("Error saving quiz config:", error)
    return NextResponse.json(
      { error: "Error al guardar configuración", details: error?.message },
      { status: 500 }
    )
  }
}

