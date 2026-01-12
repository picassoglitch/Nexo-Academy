// Simple script to make a user admin via API
// Make sure the dev server is running: npm run dev

const email = process.argv[2]

if (!email) {
  console.error("❌ Por favor proporciona un email:")
  console.log("   npm run make-admin-simple <email>")
  console.log("   Ejemplo: npm run make-admin-simple picassoglitch@gmail.com")
  process.exit(1)
}

async function makeAdmin() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/bootstrap-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ ${data.message}`)
      console.log(`User ID: ${data.user.id}`)
    } else {
      console.error(`❌ Error: ${data.error}`)
      if (data.message) console.error(`   ${data.message}`)
    }
  } catch (error: any) {
    console.error("❌ Error de conexión:", error.message)
    console.log("   Asegúrate de que el servidor esté corriendo: npm run dev")
  }
}

makeAdmin()


