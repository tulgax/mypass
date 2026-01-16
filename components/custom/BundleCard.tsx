"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type BundleCardProps = {
  image: string
  imageAlt?: string
  title: string
  price: string
  description: string
  onSelect?: () => void
  className?: string
}

export function BundleCard({
  image,
  imageAlt,
  title,
  price,
  description,
  onSelect,
  className,
}: BundleCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 md:gap-4 rounded-xl p-1.5 md:p-2 hover:bg-muted/50 cursor-pointer transition-all hover:scale-[1.02]",
        className
      )}
    >
      <div className="relative h-12 w-12 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs md:text-sm font-medium">{title}</h4>
        <p className="mt-0.5 md:mt-1 text-xs md:text-sm font-medium">
          {price}
        </p>
        <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      {onSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      )}
    </div>
  )
}
