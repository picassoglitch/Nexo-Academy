import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      console.warn("RESEND_API_KEY not configured, skipping email send")
      return NextResponse.json({ success: true, skipped: true })
    }

    const { email, name, tier, tierName, confirmationLink } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    await resend.emails.send({
      from: getEmailSender(),
      to: email,
      subject: "¡Bienvenido a Nexo! Confirma tu email para activar tu cuenta",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">¡Bienvenido a Nexo!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hola ${name || "Estudiante"},</p>
            
            <p style="font-size: 16px;">
              ¡Tu pago ha sido procesado exitosamente! Ya tienes acceso como <strong>${tierName || tier}</strong>.
            </p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h2 style="margin-top: 0; color: #856404;">⚠️ Confirma tu Email</h2>
              <p style="margin-bottom: 10px; color: #856404;">
                Para activar tu cuenta y acceder a tu dashboard, necesitas confirmar tu dirección de email.
              </p>
              ${confirmationLink ? `
              <div style="text-align: center; margin: 15px 0;">
                <a href="${confirmationLink}" 
                   style="background: #ffc107; 
                          color: #856404; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Confirmar mi Email
                </a>
              </div>
              ` : `
              <p style="margin-bottom: 0; color: #856404;">
                Revisa tu bandeja de entrada para el enlace de confirmación o inicia sesión en ${siteUrl}/login
              </p>
              `}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea;">🎁 Bonus de Bienvenida</h2>
              <p style="margin-bottom: 0;">
                Descarga tu "Fast-Start Kit" con prompts y plantillas listas para usar. 
                Disponible en tu dashboard después de confirmar tu email.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block; 
                        font-weight: bold;">
                Ir a Iniciar Sesión
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px; text-align: center;">
              Si no solicitaste esta cuenta, puedes ignorar este email.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error sending welcome email:", error)
    // Don't fail the request if email fails
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}

