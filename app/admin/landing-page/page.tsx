import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import LandingPageAdmin from "@/components/admin/landing-page-admin"

export const dynamic = "force-dynamic"

const DEFAULT_CONFIG = {
  heroTitle: "Aprende a usar IA para generar ingresos reales, con guías probadas y una comunidad que te respalda",
  heroSubtitle: "Educación práctica enfocada en ejecución. Únete a cientos de emprendedores que ya están transformando ideas en negocios con IA.",
  heroCtaText: "Empieza a ganar dinero",
  heroCtaLink: "/quiz",
  heroSecondaryCtaText: "Ver Cómo Funciona",
  aboutTitle: "Somos un equipo de ingenieros en IA con experiencia real en startups",
  aboutDescription: "Hemos construido y escalado productos con IA que generan ingresos reales. Ahora compartimos ese conocimiento contigo.",
  aboutFeature1: "+10 años de experiencia en IA",
  aboutFeature2: "Productos escalados a miles de usuarios",
  aboutFeature3: "Con visión global y experiencia internacional",
  videoUrl: "",
  videoTitle: "Video: Conoce más sobre Nexo y nuestro enfoque",
  videoDescription: "",
}

export default async function AdminLandingPageConfig() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
    redirect("/dashboard")
  }

  // Get current config
  let config = DEFAULT_CONFIG
  try {
    const configRecord = await prisma.quizConfig.findUnique({
      where: { key: "landing_page" },
    })

    if (configRecord && configRecord.value) {
      const parsedValue = typeof configRecord.value === "string" 
        ? JSON.parse(configRecord.value) 
        : configRecord.value
      config = { ...DEFAULT_CONFIG, ...parsedValue }
    }
  } catch (error) {
    console.error("Error loading landing page config:", error)
  }

  return <LandingPageAdmin initialConfig={config} />
}



