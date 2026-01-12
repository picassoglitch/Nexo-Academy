import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import PagesAdmin from "@/components/admin/pages-admin"

export const dynamic = "force-dynamic"

// Define available pages that can be edited
export const AVAILABLE_PAGES = [
  {
    id: "home",
    name: "Home page",
    route: "/",
    description: "Página principal de la aplicación",
  },
  {
    id: "terms",
    name: "Terms of Use",
    route: "/terminos",
    description: "Términos y condiciones de uso",
  },
  {
    id: "privacy",
    name: "Privacy Policy",
    route: "/privacidad",
    description: "Política de privacidad",
  },
  {
    id: "disclaimer",
    name: "Disclaimer",
    route: "/disclaimer",
    description: "Descargo de responsabilidad",
  },
  {
    id: "aviso-legal",
    name: "Aviso Legal",
    route: "/aviso-legal",
    description: "Aviso legal",
  },
]

export default async function AdminPagesPage() {
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

  // Load all page contents
  const pageContents: Record<string, any> = {}
  
  for (const page of AVAILABLE_PAGES) {
    try {
      const configRecord = await prisma.quizConfig.findUnique({
        where: { key: `page_${page.id}` },
      })

      if (configRecord && configRecord.value) {
        const parsedValue = typeof configRecord.value === "string" 
          ? JSON.parse(configRecord.value) 
          : configRecord.value
        pageContents[page.id] = parsedValue
      }
    } catch (error) {
      console.error(`Error loading page content for ${page.id}:`, error)
    }
  }

  return <PagesAdmin pages={AVAILABLE_PAGES} pageContents={pageContents} />
}
