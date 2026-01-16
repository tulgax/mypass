"use client"

import { cn } from "@/lib/utils"

export type DateItem = {
  day: string
  date: number
  displayDate: string
  status: string
  available: boolean
  slotCount?: number
}

type DateSelectorProps = {
  dates: DateItem[]
  selectedDate: number
  onDateSelect: (date: number) => void
  className?: string
}

export function DateSelector({
  dates,
  selectedDate,
  onDateSelect,
  className,
}: DateSelectorProps) {
  return (
    <div className={cn("overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0", className)}>
      <div className="grid grid-cols-7 gap-2 min-w-[500px] md:min-w-0">
        {dates.map((item) => (
          <div
            key={`${item.day}-${item.date}`}
            onClick={() => onDateSelect(item.date)}
            className={cn(
              "rounded-lg border p-1.5 md:p-2 text-center cursor-pointer transition-colors",
              selectedDate === item.date
                ? "border-transparent bg-muted"
                : "border-border/50 hover:bg-muted/50"
            )}
          >
            <div className="text-[10px] md:text-xs text-muted-foreground">
              {item.day}
            </div>
            <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-medium">
              {item.displayDate}
            </div>
            <div className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
              {!item.available ? (
                <span className="text-muted-foreground/60">
                  {item.status}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-0.5 md:gap-1">
                  <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-green-500"></span>
                  <span className="hidden sm:inline">
                    {item.slotCount !== undefined
                      ? `${item.slotCount} ${item.status}`
                      : item.status}
                  </span>
                  <span className="sm:hidden">
                    {item.slotCount !== undefined ? item.slotCount : ""}
                  </span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
