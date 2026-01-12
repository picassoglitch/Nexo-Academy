import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { IncomePath, Tier } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()

    if (!answers) {
      return NextResponse.json(
        { error: "Answers requeridos" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Save quiz response
    const quizResponse = await prisma.quizResponse.create({
      data: {
        payload: answers,
      },
    })

    // Calculate recommended path and tier based on answers
    let recommendedPath: IncomePath = IncomePath.PATH1
    let recommendedTier: Tier = Tier.STARTER

    // Path recommendation logic
    if (answers.preference === "servicios") {
      recommendedPath = IncomePath.PATH1
    } else if (answers.preference === "contenido") {
      recommendedPath = IncomePath.PATH2
    } else if (answers.preference === "productos") {
      recommendedPath = IncomePath.PATH3
    } else if (answers.preference === "consultoria") {
      recommendedPath = IncomePath.PATH4
    } else if (answers.preference === "saas") {
      recommendedPath = IncomePath.PATH5
    } else {
      // Default to PATH1 if unsure
      recommendedPath = IncomePath.PATH1
    }

    // Tier recommendation logic
    const incomeRange = answers.income || "0-5000"
    const timeAvailable = answers.time || "2-4h"
    
    if (incomeRange === "30000+" || timeAvailable === "10h+") {
      recommendedTier = Tier.OPERATOR
    } else if (incomeRange === "15000-30000" || timeAvailable === "5-10h") {
      recommendedTier = Tier.PRO
    } else {
      recommendedTier = Tier.STARTER
    }

    // Create plan - Prisma will accept enum values as strings
    const plan = await prisma.plan.create({
      data: {
        quizResponseId: quizResponse.id,
        recommendedPath: recommendedPath as any,
        recommendedTier: recommendedTier as any,
        planJson: {
          answers,
          reasoning: "Basado en tus respuestas",
        },
      },
    })

    return NextResponse.json(
      { planId: plan.id, quizResponseId: quizResponse.id },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error: any) {
    console.error("Error submitting quiz:", error)
    console.error("Error stack:", error?.stack)
    console.error("Error name:", error?.name)
    console.error("Error message:", error?.message)
    
    // Log more details for debugging
    if (error?.code) {
      console.error("Prisma error code:", error.code)
    }
    if (error?.meta) {
      console.error("Prisma error meta:", JSON.stringify(error.meta, null, 2))
    }
    
    return NextResponse.json(
      { 
        error: "Error al procesar el quiz", 
        details: error?.message || "Error desconocido",
        code: error?.code,
        meta: error?.meta,
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

