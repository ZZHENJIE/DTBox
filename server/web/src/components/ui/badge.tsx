import * as React from "react"

import { cn } from "~/lib/utils"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "destructive" | "outline"
}) {
  const variantClasses = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "bg-destructive text-white hover:bg-destructive/80",
    outline:
      "text-foreground border",
  }

  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] overflow-hidden",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
