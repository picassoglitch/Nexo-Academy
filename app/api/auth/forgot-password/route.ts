import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"
import { checkRateLimit, rateLimitExceededResponse, RATE_LIMITS } from "@/lib/rate-limit"

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
      // Don't reveal if user exists or not for security
      // Return success anyway to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "Si existe una cuenta con este email, recibirÃ¡s un enlace para restablecer tu contraseÃ±a.",
      })
    }

    // Generate password reset link
    let resetLink = null
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error("Error generating password reset link:", linkError)
        return NextResponse.json(
          { error: "Error al generar el enlace de recuperaciÃ³n. Por favor, intenta de nuevo." },
          { status: 500 }
        )
      }

      resetLink = linkData.properties.action_link
      console.log("Password reset link generated successfully for:", email)
    } catch (linkGenError) {
      console.error("Exception generating password reset link:", linkGenError)
      return NextResponse.json(
        { error: "Error al generar el enlace de recuperaciÃ³n. Por favor, intenta de nuevo." },
        { status: 500 }
      )
    }

    // Send password reset email via Resend if available
    if (resend && resetLink) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        
        await resend.emails.send({
          from: getEmailSender(),
          to: email,
          subject: "Restablece tu contraseÃ±a - Nexo",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Restablece tu ContraseÃ±a</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px;">Hola,</p>
                
                <p style="font-size: 16px;">
                  Has solicitado restablecer tu contraseÃ±a para tu cuenta de Nexo. Haz clic en el botÃ³n de abajo para crear una nueva contraseÃ±a.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block; 
                            font-weight: bold;">
                    Restablecer ContraseÃ±a
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  O copia y pega este enlace en tu navegador:
                </p>
                <p style="font-size: 12px; color: #999; word-break: break-all;">
                  ${resetLink}
                </p>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>âš ï¸ Importante:</strong> Este enlace expirarÃ¡ en 1 hora. Si no solicitaste este cambio, puedes ignorar este email de forma segura.
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Si no solicitaste este cambio, puedes ignorar este email de forma segura.
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  Si tienes alguna pregunta, no dudes en contactarnos.<br>
                  El equipo de Nexo
                </p>
              </div>
            </body>
            </html>
          `,
        })

        return NextResponse.json({
          success: true,
          message: "Se ha enviado un enlace para restablecer tu contraseÃ±a. Por favor, revisa tu bandeja de entrada.",
        })
      } catch (emailError) {
        console.error("Error sending email via Resend:", emailError)
        // Fall through to return the link directly (for manual use if needed)
      }
    }

    // Resend is required - return error if not configured
    if (!resend) {
      console.error("âŒ RESEND_API_KEY not configured, cannot send email")
      return NextResponse.json(
        { 
          error: "El servicio de email no estÃ¡ configurado. Por favor, contacta al soporte tÃ©cnico.",
          link: resetLink // Provide link as fallback for manual use
        },
        { status: 500 }
      )
    }

    // If we get here, Resend failed but is configured
    return NextResponse.json(
      { 
        error: "Error al enviar el email. Por favor, intenta de nuevo mÃ¡s tarde o contacta al soporte.",
        link: resetLink // Provide link as fallback
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Error inesperado. Por favor, intenta de nuevo." },
      { status: 500 }
    )
  }
}

