"use client"

import { CtaButton } from "@/components/ui/cta-button"
import { Card9 } from "@/components/cards/card-9"

function CtaSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <Card9
          title={
            <h2 className="text-3xl font-medium tracking-[-0.05em] text-center">
              Manage bookings and payments easier
            </h2>
          }
          content={
            <div className="flex items-center justify-center">
              <CtaButton>Try 14 days for free</CtaButton>
            </div>
          }
        />
      </div>
    </section>
  )
}

export { CtaSection }
