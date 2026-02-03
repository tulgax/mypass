"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useRef, useEffect } from "react"

export type TabItem = {
  id: string
  label: string
}

type AnimatedTabsProps<T extends string> = {
  tabs: TabItem[]
  activeTab: T
  onTabChange: (tab: T) => void
  className?: string
  layoutId?: string
}

export function AnimatedTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  layoutId = "activeTab",
}: AnimatedTabsProps<T>) {
  const prevActiveTab = useRef<T | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
    prevActiveTab.current = activeTab
  }, [activeTab])

  const shouldAnimate = !isInitialMount.current && prevActiveTab.current !== activeTab

  return (
    <div
      className={cn(
        "flex gap-6 border-b border-border relative",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as T)}
            className={cn(
              "relative pb-2 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId={shouldAnimate ? layoutId : undefined}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30 
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
