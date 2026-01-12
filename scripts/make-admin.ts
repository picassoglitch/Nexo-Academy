import "dotenv/config"
import { PrismaClient } from "@prisma/client"

// PrismaClient reads DATABASE_URL from environment variables automatically
const prisma = new PrismaClient({} as any)

async function makeAdmin(email: string) {
  try {
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

    console.log(`✅ Usuario ${email} ahora es ADMIN`)
    console.log(`User ID: ${user.id}`)
    return user
  } catch (error) {
    console.error("Error:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error("❌ Por favor proporciona un email:")
  console.log("   npm run make-admin <email>")
  console.log("   Ejemplo: npm run make-admin picassoglitch@gmail.com")
  process.exit(1)
}

makeAdmin(email)
  .then(() => {
    console.log("✅ Completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })

