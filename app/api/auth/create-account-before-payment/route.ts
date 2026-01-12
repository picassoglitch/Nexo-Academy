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

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if user already exists in Supabase
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email. Por favor, inicia sesión." },
        { status: 400 }
      )
    }

    // Check if user exists in Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email },
    })

    // Create user in Supabase
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Will be confirmed after payment
      user_metadata: {
        name: name || null,
        created_via: "checkout_pre_payment",
      },
    })

    if (createError || !newUser.user) {
      console.error("Error creating Supabase user:", createError)
      return NextResponse.json(
        { error: "Error al crear la cuenta", details: createError?.message },
        { status: 500 }
      )
    }

    // Create or update user in Prisma (like before - accounts created immediately)
    if (dbUser) {
      // Update existing user with Supabase ID
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          supabaseId: newUser.user.id,
          name: name || dbUser.name,
        },
      })
    } else {
      // Create new user in Prisma
      await prisma.user.create({
        data: {
          email,
          name: name || null,
          supabaseId: newUser.user.id,
          tier: 0, // Will be updated after payment
        },
      })
    }

    // Generate and send confirmation email (non-blocking)
    try {
      // Use email_redirect_to to redirect after confirmation
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "signup",
        email: email,
        password: password, // Required for signup type
        options: {
          email_redirect_to: `${siteUrl}/auth/confirm-email`,
        },
      })

      if (!linkError && linkData?.properties?.action_link) {
        // Send confirmation email via our email service
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/emails/send-confirmation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: name || null,
            confirmationLink: linkData.properties.action_link,
          }),
        }).catch((err) => {
          console.error("Error sending confirmation email (non-critical):", err)
        })
      }
    } catch (emailError) {
      console.error("Error generating confirmation link (non-critical):", emailError)
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      email: newUser.user.email,
      message: "Cuenta creada exitosamente",
    })
  } catch (error: any) {
    console.error("Error creating account before payment:", error)
    return NextResponse.json(
      { error: "Error al crear la cuenta", details: error?.message },
      { status: 500 }
    )
  }
}

