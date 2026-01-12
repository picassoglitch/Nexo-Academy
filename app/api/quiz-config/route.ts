import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public API to get quiz config (no auth required for reading)
export async function GET(request: NextRequest) {
  try {
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

