"use client"

import { Button } from "@/components/ui/button"
import { CtaButton } from "@/components/ui/cta-button"
import { useTranslations } from "next-intl"

function HeroSection() {
  const t = useTranslations('landing.hero')
  
  return (
    <section className="bg-background pt-20">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-14 px-6 text-center md:px-8">
        <div className="flex max-w-[780px] flex-col items-center gap-8">
          <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
            {t('title')}
          </h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <CtaButton size="default">{t('ctaPrimary')}</CtaButton>
              <Button variant="secondary" size="default">
                {t('ctaSecondary')}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1136px] overflow-hidden rounded-xl">
          <img
            src="https://assets.ycodeapp.com/assets/app83049/Images/published/scheduling-software-ny7tdkagvo.webp"
            alt="Scheduling software interface"
            className="h-[400px] w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
