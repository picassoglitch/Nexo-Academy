"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/curso", label: "Aprender", icon: BookOpen },
    { href: "https://discord.com/invite/KuVCRgKrpM", label: "Comunidad", icon: Users, external: true },
    { href: "/dashboard/profile", label: "Perfil", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isExternal = (item as any).external
          
          if (isExternal) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  "text-gray-500 hover:text-purple-600"
                )}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </a>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-purple-600"
              )}
            >
              <Icon className={cn("h-6 w-6 mb-1", isActive && "scale-110")} />
              <span className={cn("text-xs", isActive && "font-semibold")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

