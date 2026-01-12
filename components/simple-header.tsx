"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import NexusLogo from "./nexus-logo"

export default function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NexusLogo width={120} height={40} />
        </div>
      </div>
    </header>
  )
}


