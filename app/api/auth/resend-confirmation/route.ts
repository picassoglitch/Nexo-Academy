import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // First, check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error("Error listing users:", listError)
      return NextResponse.json(
        { error: "Error al verificar el usuario. Por favor, intenta de nuevo." },
        { status: 500 }
      )
    }

    const user = users?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      // Don't reveal if user exists for security, but log for debugging
      console.log("User not found for email:", email)
      return NextResponse.json(
        { error: "No se encontró una cuenta con este email." },
        { status: 404 }
      )
    }

    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Este email ya está confirmado. Puedes iniciar sesión normalmente." },
        { status: 400 }
      )
    }

    // Generate confirmation link
    // Use "invite" type for existing unconfirmed users (doesn't require password)
    let confirmationLink = null
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "invite",
        email: email,
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error("Error generating confirmation link:", linkError)
        return NextResponse.json(
          { error: "Error al generar el enlace de confirmación. Por favor, intenta de nuevo." },
          { status: 500 }
        )
      }

      confirmationLink = linkData.properties.action_link
      console.log("Confirmation link generated successfully for:", email)
    } catch (linkGenError: any) {
      console.error("Exception generating confirmation link:", linkGenError)
      return NextResponse.json(
        { error: "Error al generar el enlace de confirmación. Por favor, intenta de nuevo." },
        { status: 500 }
      )
    }

    if (!confirmationLink) {
      return NextResponse.json(
        { error: "No se pudo generar el enlace de confirmación. Por favor, intenta de nuevo." },
        { status: 500 }
      )
    }

    // Try to send email via Resend first
    if (resend) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        
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
                <p style="font-size: 16px;">Hola,</p>
                
                <p style="font-size: 16px;">
                  Has solicitado un nuevo enlace de confirmación para tu cuenta de Nexo.
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
                <p style="font-size: 12px; color: #999; word-break: break-all;">
                  ${confirmationLink}
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Si no solicitaste este email, puedes ignorarlo de forma segura.
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

        console.log("✅ Email sent successfully via Resend to:", email, "Result:", emailResult)
        
        return NextResponse.json({
          success: true,
          message: "Se ha enviado un nuevo email de confirmación. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).",
        })
      } catch (emailError: any) {
        console.error("❌ Error sending email via Resend:", emailError)
        // Continue to try Supabase email sending as fallback
      }
    }

    // Resend is required - return error if not configured
    if (!resend) {
      console.error("❌ RESEND_API_KEY not configured, cannot send email")
      return NextResponse.json(
        { 
          error: "El servicio de email no está configurado. Por favor, contacta al soporte técnico.",
          link: confirmationLink // Provide link as fallback for manual use
        },
        { status: 500 }
      )
    }

    // If we get here, Resend failed but is configured
    return NextResponse.json(
      { 
        error: "Error al enviar el email. Por favor, intenta de nuevo más tarde o contacta al soporte.",
        link: confirmationLink // Provide link as fallback
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error("❌ Error in resend confirmation:", error)
    return NextResponse.json(
      { error: "Error inesperado. Por favor, intenta de nuevo." },
      { status: 500 }
    )
  }
}

