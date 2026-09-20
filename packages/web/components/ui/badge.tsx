import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-[#e1f4f3] bg-[#e1f4f3]/10 text-[#e1f4f3]",
        emerald:
          "border-[#10b981] bg-[#10b981]/10 text-[#10b981]",
        cyan:
          "border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4]",
        teal:
          "border-[#14b8a6] bg-[#14b8a6]/10 text-[#14b8a6]",
        violet:
          "border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#8b5cf6]",
        secondary:
          "border-[#BFBFBF]/40 bg-[#181b26] text-white",
        destructive:
          "border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]",
        outline:
          "border-[#BFBFBF] bg-transparent text-[#bfbfbf]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
