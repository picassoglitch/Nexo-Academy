import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      console.warn("RESEND_API_KEY not configured, skipping confirmation email")
      return NextResponse.json({ success: true, skipped: true })
    }

    const { email, name, confirmationLink } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    if (!confirmationLink) {
      return NextResponse.json(
        { error: "Enlace de confirmación es requerido" },
        { status: 400 }
      )
    }

    await resend.emails.send({
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error sending confirmation email:", error)
    // Don't fail the request if email fails
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}


