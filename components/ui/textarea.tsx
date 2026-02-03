import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "rounded-md border border-input bg-background px-2 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 resize-none field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
