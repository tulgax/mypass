"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CtaButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function CtaButton({ children, className, ...props }: CtaButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Button
      className={cn("group relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        <motion.span
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
            ease: "easeInOut",
          }}
          className="inline-flex items-center"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.span>
      </span>
    </Button>
  )
}
