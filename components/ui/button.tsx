import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:-translate-y-[1px] hover:shadow-lift",
        primary:
          "bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:-translate-y-[1px] hover:shadow-lift",
        destructive:
          "bg-red-600 text-white shadow-soft hover:bg-red-700 hover:-translate-y-[1px] hover:shadow-lift",
        outline:
          "border-2 border-slate-300 bg-white text-slate-900 shadow-soft hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-[1px] hover:shadow-lift",
        secondary:
          "bg-slate-100 text-slate-900 shadow-soft hover:bg-slate-200 hover:-translate-y-[1px] hover:shadow-lift",
        ghost: "text-slate-700 hover:bg-slate-100 hover:-translate-y-[1px]",
        link: "text-brand-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        md: "h-10 rounded-full px-6",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

