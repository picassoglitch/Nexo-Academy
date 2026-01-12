import Image from "next/image"

interface NexusAvatarProps {
  size?: number
  className?: string
}

export default function NexusAvatar({ 
  size = 40,
  className = ""
}: NexusAvatarProps) {
  return (
    <div 
      className={`rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/nexus-avatar.svg"
        alt="NEXUS"
        width={size}
        height={size}
        className="rounded-full"
        style={{ 
          objectFit: "contain", 
          width: `${size}px`, 
          height: `${size}px`,
          padding: `${size * 0.1}px`
        }}
      />
    </div>
  )
}

