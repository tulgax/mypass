"use client"

import { motion } from "motion/react"

export function StatusBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5">
      <div className="relative flex items-center justify-center">
        {/* Breathing dot with glow effect */}
        <motion.div
          className="absolute h-2 w-2 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute h-2 w-2 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative h-2 w-2 rounded-full bg-green-500" />
      </div>
      <span className="text-xs text-muted-foreground">All systems operational</span>
    </div>
  )
}
