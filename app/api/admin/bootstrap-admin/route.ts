import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This is a one-time bootstrap route to make the first admin
// Should be protected or removed after first use
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
      },
      create: {
        email,
        role: "ADMIN",
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        message: `Usuario ${email} ahora es ADMIN`,
        user 
      },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Error making admin:", error)
    return NextResponse.json(
      { error: "Error al crear admin", message: error?.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}


