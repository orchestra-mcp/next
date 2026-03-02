import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }>(
  ({ className, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground p-5",
        hover && "cursor-pointer transition-colors hover:border-primary/40 hover:bg-card/80",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold text-base leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

export { Card, CardTitle, CardDescription }
