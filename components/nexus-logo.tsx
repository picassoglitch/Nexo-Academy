import Link from "next/link"

interface NexusLogoProps {
  className?: string
  href?: string
  width?: number
  height?: number
}

export default function NexusLogo({ 
  className = "", 
  href = "/",
  width,
  height
}: NexusLogoProps) {
  const logoContent = (
    <div className={`flex flex-col ${className}`} style={{ width, height }}>
      <span className="text-xl font-bold text-gray-900 leading-tight">NEXUS</span>
      <span className="text-[10px] font-normal text-gray-500 leading-tight uppercase tracking-wide">Inteligencia Artificial</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

