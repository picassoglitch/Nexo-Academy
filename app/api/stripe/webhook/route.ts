import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { createServiceClient } from "@/lib/supabase/service"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables")
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error("Stripe is not configured")
    return NextResponse.json(
      { error: "Stripe no está configurado" },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    if (!webhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail in production.")
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        console.log("🔔 Webhook: checkout.session.completed received for session:", session.id)
        console.log("   Payment status:", session.payment_status)
        console.log("   Metadata:", JSON.stringify(session.metadata, null, 2))

        // Only process if payment is successful
        if (session.payment_status === "paid") {
          const metadata = session.metadata || {}
          const userEmail = metadata.user_email || session.customer_email || ""
          
          console.log("   Processing paid session for email:", userEmail)
          
          if (!userEmail || !metadata?.tier) {
            console.error("❌ Missing email or tier in checkout session:", session.id, { metadata, customer_email: session.customer_email })
            return NextResponse.json({ received: true })
          }

          const tier = metadata.tier
          const tierNumber = parseInt(metadata.tier_number || "0")
          
          console.log("   Tier from metadata:", tier, "Tier number:", tierNumber)

          // Check if user has Supabase account AND it's confirmed (to determine if we need activation code)
          let userHasAccount = false
          let userEmailConfirmed = false
          try {
            const supabase = createServiceClient()
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const existingUser = existingUsers?.users?.find(
              (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
            )
            userHasAccount = !!existingUser
            userEmailConfirmed = !!existingUser?.email_confirmed_at
            // Only consider it a "real" account if email is confirmed
            // If email is not confirmed, treat it as if they don't have an account (need activation code)
            userHasAccount = userHasAccount && userEmailConfirmed
          } catch (supabaseError) {
            console.warn("Could not check Supabase account (non-critical):", supabaseError)
            // Assume user doesn't have account if we can't check
            userHasAccount = false
            userEmailConfirmed = false
          }

          // Get or update user by email (more reliable than ID)
          let dbUser = await prisma.user.findUnique({
            where: { email: userEmail },
          })

          console.log("   User found in DB:", dbUser ? `Yes (ID: ${dbUser.id}, Current Tier: ${dbUser.tier})` : "No")
          console.log("   User has Supabase account:", userHasAccount, "Email confirmed:", userEmailConfirmed)

          if (!dbUser) {
            // Create user if doesn't exist (tier 0 for now - will be activated with code)
            dbUser = await prisma.user.create({
              data: {
                email: userEmail,
                name: metadata.user_name || null,
                tier: 0, // Will be activated with code
              },
            })
            console.log(`✅ Created new user (tier 0, pending activation) for:`, userEmail)
          } else {
            // If user already has account, update tier immediately
            if (userHasAccount) {
              const currentTier = dbUser.tier || 0
              const newTier = Math.max(currentTier, tierNumber)
              
              if (newTier > currentTier) {
                dbUser = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { tier: newTier },
                })
                console.log(`✅ Updated user tier from ${currentTier} to ${newTier} (${tier}) for:`, userEmail)
              }
            }
            // If user doesn't have account, keep tier at 0 - will be activated with code
          }

          // Save Stripe customer ID for recurring payments
          if (session.customer && typeof session.customer === "string" && !dbUser.mpCustomerId) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { mpCustomerId: session.customer },
            })
          }

          // Create order
          const order = await prisma.order.create({
            data: {
              userId: dbUser.id,
              externalId: session.id,
              status: "APPROVED",
              amount: session.amount_total || 0,
              currency: "USD",
            },
          })

          // ALWAYS generate activation code - user will use it after creating account
          // This allows payment without account, then user creates account and activates with code
          const { generateActivationCode } = await import("@/lib/activation-code")
          let activationCode = generateActivationCode()
          
          // Ensure code is unique
          let codeExists = await prisma.activationCode.findUnique({
            where: { code: activationCode },
          })
          let attempts = 0
          while (codeExists && attempts < 10) {
            activationCode = generateActivationCode()
            codeExists = await prisma.activationCode.findUnique({
              where: { code: activationCode },
            })
            attempts++
          }

          await prisma.activationCode.create({
            data: {
              code: activationCode,
              tier: tierNumber,
              email: userEmail,
              orderId: order.id,
            },
          })
          console.log(`✅ Generated activation code ${activationCode} for tier ${tierNumber} (${tier}) - user can activate after creating account`)

          // Create Supabase account AFTER payment confirmation
          let supabaseUserId: string | null = null
          let userNeedsConfirmation = false
          
          try {
            const supabase = createServiceClient()
            const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
            
            if (listError) {
              console.error("Error listing Supabase users:", listError)
            }
            
            const existingUser = existingUsers?.users?.find(
              (u) => u.email?.toLowerCase() === dbUser.email.toLowerCase()
            )

            if (existingUser) {
              supabaseUserId = existingUser.id
              userNeedsConfirmation = !existingUser.email_confirmed_at
              
              // Get current tier from user metadata or Prisma
              const currentTierFromMetadata = existingUser.user_metadata?.tier as number || 0
              const currentTierFromDB = dbUser.tier || 0
              const currentTier = Math.max(currentTierFromMetadata, currentTierFromDB)
              
              // Use the highest tier (current or new)
              const finalTier = Math.max(currentTier, dbUser.tier || 0)
              const finalTierName = finalTier === 1 ? "STARTER" : finalTier === 2 ? "PRO" : finalTier === 3 ? "OPERATOR" : "FREE"
              
              // User already exists, just update metadata (don't auto-confirm email)
              await supabase.auth.admin.updateUserById(existingUser.id, {
                user_metadata: {
                  ...existingUser.user_metadata,
                  tier: finalTier,
                  tier_name: finalTierName,
                  payment_confirmed: true,
                },
              })

              // Update Prisma user with Supabase ID if not set
              if (!dbUser.supabaseId) {
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { supabaseId: existingUser.id },
                })
              }

              console.log("Supabase user updated for:", dbUser.email, "email_confirmed:", existingUser.email_confirmed_at ? "yes" : "no", "needs_confirmation:", userNeedsConfirmation)
            } else {
              // Create account with password from metadata (collected before payment)
              const accountPassword = metadata.account_password || Math.random().toString(36).slice(-16) + "A1!@#$"
              
              // Use the highest tier (from Prisma, which already has the max logic)
              const finalTier = dbUser.tier || tierNumber
              const finalTierName = finalTier === 1 ? "STARTER" : finalTier === 2 ? "PRO" : finalTier === 3 ? "OPERATOR" : "FREE"
              
              const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: dbUser.email,
                password: accountPassword,
                email_confirm: false, // User needs to confirm email - will send confirmation link
                user_metadata: {
                  name: metadata.user_name || dbUser.name || null,
                  tier: finalTier,
                  tier_name: finalTierName,
                  created_via: "stripe_payment_confirmed",
                  payment_confirmed: true,
                },
              })

              if (!createError && newUser.user) {
                supabaseUserId = newUser.user.id
                userNeedsConfirmation = true // New users always need confirmation
                
                // Update Prisma user with Supabase ID
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { supabaseId: newUser.user.id },
                })
                console.log("Supabase account created after payment for:", dbUser.email)
              } else {
                console.error("Error creating Supabase account:", createError)
              }
            }
          } catch (supabaseError) {
            console.error("Error creating/updating Supabase user:", supabaseError)
          }

          console.log("Payment successful for user:", dbUser.id, "email:", dbUser.email, "tier:", tier)

          // Send welcome email with confirmation link (non-blocking)
          try {
            // Generate confirmation link for users who need to confirm email
            let confirmationLink = null
            const supabaseForLink = createServiceClient()
            
            // Check if user needs email confirmation
            let needsConfirmation = userNeedsConfirmation
            if (!needsConfirmation && supabaseUserId) {
              // Double-check by querying the user
              const { data: checkUsers } = await supabaseForLink.auth.admin.listUsers()
              const checkUser = checkUsers?.users?.find((u) => u.id === supabaseUserId)
              needsConfirmation = !checkUser?.email_confirmed_at
            }

            if (needsConfirmation && supabaseUserId) {
              // Generate confirmation link for unconfirmed users
              try {
                // For unconfirmed users, we need to generate a signup confirmation link
                // This works for both new and existing unconfirmed users
                // Use email_redirect_to to redirect after confirmation (like regular signup)
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
                const { data: linkData, error: linkError } = await supabaseForLink.auth.admin.generateLink({
                  type: "invite",
                  email: dbUser.email,
                })
                
                if (!linkError && linkData?.properties?.action_link) {
                  confirmationLink = linkData.properties.action_link
                  console.log("Confirmation link generated (signup) for:", dbUser.email)
                } else {
                  console.error("Error generating confirmation link (signup):", linkError)
                  
                  // Try alternative: use invite link which also confirms email
                  try {
                    const { data: inviteData, error: inviteError } = await supabaseForLink.auth.admin.generateLink({
                      type: "invite",
                      email: dbUser.email,
                    })
                    if (!inviteError && inviteData?.properties?.action_link) {
                      confirmationLink = inviteData.properties.action_link
                      console.log("Invite link generated as fallback for:", dbUser.email)
                    } else {
                      console.error("Error generating invite link:", inviteError)
                    }
                  } catch (inviteErr) {
                    console.error("Exception generating invite link:", inviteErr)
                  }
                }
              } catch (linkError) {
                console.error("Exception generating confirmation link:", linkError)
              }
            } else {
              console.log("User email already confirmed, skipping confirmation link generation for:", dbUser.email)
            }

            // Send welcome email with confirmation link directly (more reliable than fetch)
            console.log("Sending welcome email to:", dbUser.email, "with confirmation link:", confirmationLink ? "yes" : "no")
            
            if (resend) {
              try {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
                // Use the actual tier from database (which has the max logic applied)
                const actualTier = dbUser.tier || tierNumber
                const actualTierName = actualTier === 1 ? "STARTER" : actualTier === 2 ? "PRO" : actualTier === 3 ? "OPERATOR" : "FREE"
                const tierName = actualTierName === "STARTER" ? "Starter" : actualTierName === "PRO" ? "Pro" : actualTierName === "OPERATOR" ? "Operator" : "Free"
                const userName = metadata.user_name || dbUser.name || "Estudiante"
                
                await resend.emails.send({
                  from: getEmailSender(),
                  to: dbUser.email,
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
                        <p style="font-size: 16px;">Hola ${userName},</p>
                        
                        <p style="font-size: 16px;">
                          ¡Tu pago ha sido procesado exitosamente! Ya tienes acceso como <strong>${tierName}</strong>.
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
                          <p style="font-size: 12px; color: #856404; margin-top: 10px; word-break: break-all;">
                            O copia y pega este enlace: ${confirmationLink}
                          </p>
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
                
                console.log("✅ Welcome email sent successfully via Resend to:", dbUser.email)
              } catch (resendError: any) {
                console.error("❌ Error sending email via Resend:", resendError)
                // Fallback: try the API endpoint
                try {
                  const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/emails/send-welcome`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: dbUser.email,
                      name: metadata.user_name || dbUser.name,
                      tier,
                      tierName: (dbUser.tier === 1 ? "Starter" : dbUser.tier === 2 ? "Pro" : dbUser.tier === 3 ? "Operator" : "Free"),
                      confirmationLink,
                    }),
                  })
                  if (emailResponse.ok) {
                    console.log("✅ Welcome email sent via API endpoint fallback")
                  } else {
                    console.error("❌ API endpoint fallback also failed:", await emailResponse.text())
                  }
                } catch (fetchError) {
                  console.error("❌ Both direct Resend and API endpoint failed:", fetchError)
                }
              }
            } else {
              console.warn("⚠️ RESEND_API_KEY not configured, cannot send welcome email")
              // Try API endpoint as fallback
              try {
                const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/emails/send-welcome`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: dbUser.email,
                    name: metadata.user_name || dbUser.name,
                    tier,
                    tierName: tier === "STARTER" ? "Starter" : tier === "PRO" ? "Pro" : "Operator",
                    confirmationLink,
                  }),
                })
                if (emailResponse.ok) {
                  console.log("✅ Welcome email sent via API endpoint")
                } else {
                  console.error("❌ API endpoint failed:", await emailResponse.text())
                }
              } catch (fetchError) {
                console.error("❌ API endpoint failed:", fetchError)
              }
            }
          } catch (emailError) {
            console.error("Error sending welcome email (non-critical):", emailError)
          }
        }
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("PaymentIntent succeeded:", paymentIntent.id)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("PaymentIntent failed:", paymentIntent.id)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

        // Find user by customer ID
        const dbUser = await prisma.user.findFirst({
          where: { mpCustomerId: customerId },
        })

        if (dbUser && subscription.status === "active") {
          // Get tier from subscription metadata or line items
          const metadata = subscription.metadata || {}
          const tier = metadata.tier || "STARTER"
          const tierNumber = parseInt(metadata.tier_number || "1")

          // Update user tier - only if new tier is higher (always use the highest tier)
          const currentTier = dbUser.tier || 0
          const newTier = Math.max(currentTier, tierNumber)
          
          if (newTier > currentTier) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { tier: newTier },
            })
            console.log(`✅ Subscription updated tier from ${currentTier} to ${newTier} (${tier}) for user:`, dbUser.id)
          } else {
            console.log(`ℹ️ User already has tier ${currentTier} (>= ${tierNumber}), keeping current tier for user:`, dbUser.id)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

        // Find user by customer ID
        const dbUser = await prisma.user.findFirst({
          where: { mpCustomerId: customerId },
        })

        if (dbUser) {
          // Set tier to 0 (free) when subscription is cancelled
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { tier: 0 },
          })

          console.log("Subscription cancelled for user:", dbUser.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    )
  }
}

