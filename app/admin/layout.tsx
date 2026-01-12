import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderOpen, 
  FileText, 
  Image, 
  ShoppingCart, 
  Ticket, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3,
  LogOut,
  DollarSign,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import NexusLogo from "@/components/nexus-logo"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { href: "/admin/lecciones", label: "Lecciones", icon: FileText },
    { href: "/admin/activos", label: "Plantillas", icon: Image },
    { href: "/admin/scripts", label: "Scripts", icon: FileText },
    { href: "/admin/landing-page", label: "Landing Page", icon: Globe },
    { href: "/admin/precios", label: "Precios", icon: DollarSign },
    { href: "/admin/quiz-config", label: "Config Quiz", icon: Settings },
    { href: "/admin/questionnaire-logic", label: "Lógica Cuestionario", icon: BarChart3 },
    { href: "/admin/ordenes", label: "Órdenes", icon: ShoppingCart },
    { href: "/admin/cupones", label: "Cupones", icon: Ticket },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquare },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/config", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <NexusLogo width={140} height={50} href="/" />
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              <form action="/api/auth/logout" method="post" className="mt-8">
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </form>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}

