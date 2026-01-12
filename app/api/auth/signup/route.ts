import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * POST /api/auth/signup
 * 
 * Creates a user account in Supabase and sends confirmation email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email. Por favor, inicia sesión." },
        { status: 400 }
      )
    }

    // Create user in Supabase (with email confirmation disabled - we'll send via Resend)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm, we'll send email via Resend
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

    // Generate confirmation link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: email,
      password: password,
      options: {
        email_redirect_to: `${siteUrl}/auth/confirm-email`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Error generating confirmation link:", linkError)
      return NextResponse.json(
        { error: "Error al generar el enlace de confirmación", details: linkError?.message },
        { status: 500 }
      )
    }

    const confirmationLink = linkData.properties.action_link

    // Send confirmation email via Resend
    if (!resend) {
      console.error("❌ RESEND_API_KEY not configured")
      console.error("❌ RESEND_API_KEY value:", process.env.RESEND_API_KEY ? "EXISTS (but Resend client is null)" : "MISSING")
      return NextResponse.json(
        { 
          error: "El servicio de email no está configurado. Por favor, contacta al soporte técnico.",
          link: confirmationLink // Provide link as fallback
        },
        { status: 500 }
      )
    }

    console.log("📧 Attempting to send email via Resend to:", email)
    console.log("📧 From address:", getEmailSender())
    
    try {
      const emailResult = await resend.emails.send({
        from: getEmailSender(),
        to: email,
        subject: "Confirma tu email - Nexo",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Confirma tu Email</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hola ${name || "Estudiante"},</p>
              
              <p style="font-size: 16px;">
                Gracias por crear tu cuenta en Nexo. Para activar tu cuenta y acceder a todos los beneficios, 
                necesitas confirmar tu dirección de email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Confirmar mi Email
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 4px;">
                ${confirmationLink}
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Si no solicitaste esta cuenta, puedes ignorar este email de forma segura.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                ¡Nos vemos dentro!<br>
                El equipo de Nexo
              </p>
            </div>
          </body>
          </html>
        `,
      })

      // Check if email was actually sent
      if (emailResult.error) {
        console.error("❌ Resend returned an error:", emailResult.error)
        
        // Check if it's the domain verification error
        if (emailResult.error.message?.includes("only send testing emails to your own email")) {
          console.warn("⚠️ Resend free tier limitation: Can only send to account owner's email")
          console.warn("⚠️ Solution: Verify a domain in Resend or use Supabase email")
          
          // Fallback: Use Supabase's built-in email sending
          try {
            console.log("📧 Falling back to Supabase email sending...")
            // Supabase will automatically send confirmation email when we create the user
            // But we already created it with email_confirm: false, so we need to trigger it
            // Actually, we can't easily trigger Supabase's email after creation
            // So we'll return the confirmation link directly to the user
            return NextResponse.json({
              success: true,
              message: "Cuenta creada exitosamente. Por favor, usa el enlace de confirmación a continuación.",
              userId: newUser.user.id,
              confirmationLink: confirmationLink, // Provide link directly
              warning: "Email no enviado automáticamente. Usa el enlace de confirmación proporcionado.",
            })
          } catch (fallbackError) {
            console.error("❌ Fallback also failed:", fallbackError)
            return NextResponse.json({
              success: true,
              message: "Cuenta creada exitosamente. Por favor, contacta al soporte para obtener el enlace de confirmación.",
              userId: newUser.user.id,
              confirmationLink: confirmationLink,
            })
          }
        }
        
        // Other Resend errors
        throw new Error(emailResult.error.message || "Resend API error")
      }

      console.log("✅ Signup confirmation email sent via Resend to:", email)
      console.log("✅ Email ID:", emailResult.data?.id)

      return NextResponse.json({
        success: true,
        message: "Cuenta creada exitosamente. Se ha enviado un email de confirmación.",
        userId: newUser.user.id,
      })
    } catch (emailError: any) {
      console.error("❌ Error sending email via Resend:", emailError)
      console.error("❌ Error details:", {
        message: emailError?.message,
        name: emailError?.name,
        stack: emailError?.stack,
      })
      
      // Return confirmation link even if email fails
      return NextResponse.json({
        success: true,
        message: "Cuenta creada exitosamente. Por favor, usa el enlace de confirmación a continuación.",
        userId: newUser.user.id,
        confirmationLink: confirmationLink,
        warning: "Email no enviado automáticamente. Usa el enlace de confirmación proporcionado.",
      })
    }
  } catch (error: any) {
    console.error("Error in signup:", error)
    return NextResponse.json(
      { error: "Error inesperado. Por favor, intenta de nuevo." },
      { status: 500 }
    )
  }
}
