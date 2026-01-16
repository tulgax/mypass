"use client"

import { Clock, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export type ClassSession = {
  id?: string
  name: string
  time: string
  location?: string
  spots: string
  available: boolean
}

type ClassListProps = {
  classes: ClassSession[]
  onBook?: (classItem: ClassSession) => void
  emptyMessage?: string
  className?: string
}

export function ClassList({
  classes,
  onBook,
  emptyMessage = "No classes available",
  className,
}: ClassListProps) {
  if (classes.length === 0) {
    return (
      <div
        className={cn(
          "flex h-32 md:h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 md:p-8 text-center text-muted-foreground",
          className
        )}
      >
        <p className="text-xs md:text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {classes.map((classItem, index) => (
        <div key={classItem.id || `${classItem.name}-${index}`} className="group">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
              <h4 className="text-xs md:text-sm font-medium leading-none">
                {classItem.name}
              </h4>

              <div className="flex items-center gap-3 md:gap-6 text-[10px] md:text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 md:gap-1.5">
                  <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span>{classItem.time}</span>
                </div>

                {classItem.location && (
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="hidden sm:inline">{classItem.location}</span>
                    <span className="sm:hidden">
                      {classItem.location.split(" ")[0]}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 md:gap-1.5">
                  <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span>{classItem.spots}</span>
                </div>
              </div>
            </div>

            {onBook && (
              <button
                onClick={() => onBook(classItem)}
                className="h-7 md:h-8 rounded-full bg-muted px-3 md:px-5 text-[10px] md:text-xs font-medium transition-colors hover:bg-foreground hover:text-background shrink-0"
              >
                Book
              </button>
            )}
          </div>
          {/* Separator line except for last item */}
          {index < classes.length - 1 && (
            <div className="mt-4 md:mt-6 h-px w-full bg-border/50" />
          )}
        </div>
      ))}
    </div>
  )
}
