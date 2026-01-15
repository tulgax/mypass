"use client"

import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

function LogosSection() {
  const t = useTranslations('landing.logos')
  const tHeader = useTranslations('landing.header.businessLinks')
  
  const logos = [
    tHeader('pilates.label'),
    tHeader('yoga.label'),
    tHeader('gym.label'),
    tHeader('crossfit.label'),
    tHeader('boxing.label'),
    tHeader('dance.label'),
  ]

  return (
    <section className="bg-background py-16">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <p className="text-center text-sm text-muted-foreground">
          {t('title')}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {logos.map((logo) => (
            <Badge
              key={logo}
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium"
            >
              {logo}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}

export { LogosSection }
