import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if user already exists in Supabase
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe", userId: existingUser.id },
        { status: 400 }
      )
    }

    // Create user in Supabase
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name || null,
      },
    })

    if (createError || !newUser.user) {
      console.error("Error creating Supabase user:", createError)
      return NextResponse.json(
        { error: "Error al crear la cuenta", details: createError?.message },
        { status: 500 }
      )
    }

    // Update Prisma user with Supabase ID if exists
    const dbUser = await prisma.user.findUnique({
      where: { email },
    })

    if (dbUser && !dbUser.supabaseId) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { supabaseId: newUser.user.id },
      })
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      email: newUser.user.email,
    })
  } catch (error: any) {
    console.error("Error creating account after payment:", error)
    return NextResponse.json(
      { error: "Error al crear la cuenta", details: error?.message },
      { status: 500 }
    )
  }
}

