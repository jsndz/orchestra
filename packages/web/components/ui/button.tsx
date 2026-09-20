import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-none border border-transparent font-sans font-bold uppercase tracking-[0.05em] whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#e1f4f3] text-[#0d0d0d] hover:bg-[#c2d8d7] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(225,244,243,0.3)] border-transparent",
        outline:
          "bg-[#0d0d0d] text-white border-white/20 hover:border-[#10b981] hover:text-[#10b981] hover:-translate-y-0.5",
        secondary:
          "bg-[#0d0d0d] text-white border border-white/20 hover:border-cyan-400 hover:text-cyan-300 hover:-translate-y-0.5",
        ghost:
          "bg-transparent text-[#e1f4f3] hover:bg-white/5 hover:text-white border-transparent",
        destructive:
          "bg-[#ef4444] text-white hover:bg-red-600 border-transparent",
        link: "text-[#e1f4f3] underline-offset-4 hover:underline border-transparent p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 text-sm gap-2",
        xs: "h-6 px-2 text-[11px] gap-1",
        sm: "h-8 px-3.5 text-xs gap-1.5",
        lg: "h-12 px-7 text-base gap-2.5",
        icon: "size-10",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = (asChild ? Slot.Root : "button") as any

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
