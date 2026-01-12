"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import NexusLogo from "./nexus-logo"

export default function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NexusLogo width={120} height={40} />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Inicio
            </Link>
            <Link href="/#programas" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Programas
            </Link>
            <Link href="/#como-funciona" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Cómo Funciona
            </Link>
            <Link href="/#comunidad" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Comunidad
            </Link>
            <Link href="/#quienes-somos" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Quiénes Somos
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/#programas"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Programas
            </Link>
            <Link
              href="/#como-funciona"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cómo Funciona
            </Link>
            <Link
              href="/#comunidad"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Comunidad
            </Link>
            <Link
              href="/#quienes-somos"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Quiénes Somos
            </Link>
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Iniciar Sesión
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}


