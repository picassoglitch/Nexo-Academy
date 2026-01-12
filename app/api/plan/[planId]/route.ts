import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params
    
    if (!planId) {
      return NextResponse.json({ error: "Plan ID requerido" }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        quizResponse: true,
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 })
    }

    // Serialize plan with proper enum handling
    const serializedPlan = {
      ...plan,
      recommendedPath: plan.recommendedPath as string,
      recommendedTier: plan.recommendedTier as string,
    }

    return NextResponse.json(serializedPlan, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("Error fetching plan:", error)
    console.error("Error stack:", error?.stack)
    console.error("Error name:", error?.name)
    console.error("Error message:", error?.message)
    
    if (error?.code) {
      console.error("Prisma error code:", error.code)
    }
    if (error?.meta) {
      console.error("Prisma error meta:", JSON.stringify(error.meta, null, 2))
    }
    
    return NextResponse.json(
      { 
        error: "Error al obtener el plan", 
        details: error?.message || "Error desconocido",
        code: error?.code,
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}

