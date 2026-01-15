"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import NumberFlow, { continuous } from "@number-flow/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

function PricingSection() {
  const t = useTranslations('landing.pricing')
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  
  const plans = [
    {
      name: t('plans.starter.name'),
      description: t('plans.starter.description'),
      monthlyPrice: 29,
      yearlyPrice: 19,
      highlight: false,
      features: [
        t('plans.starter.features.clients'),
        t('plans.starter.features.services'),
        t('plans.starter.features.pricingPlans'),
        t('plans.starter.features.teamMembers'),
        t('plans.starter.features.support'),
      ],
    },
    {
      name: t('plans.growth.name'),
      description: t('plans.growth.description'),
      monthlyPrice: 59,
      yearlyPrice: 49,
      highlight: true,
      features: [
        t('plans.growth.features.clients'),
        t('plans.growth.features.services'),
        t('plans.growth.features.pricingPlans'),
        t('plans.growth.features.teamMembers'),
        t('plans.growth.features.support'),
      ],
    },
    {
      name: t('plans.professional.name'),
      description: t('plans.professional.description'),
      monthlyPrice: 99,
      yearlyPrice: 79,
      highlight: false,
      features: [
        t('plans.professional.features.clients'),
        t('plans.professional.features.services'),
        t('plans.professional.features.pricingPlans'),
        t('plans.professional.features.teamMembers'),
        t('plans.professional.features.support'),
      ],
    },
    {
      name: t('plans.business.name'),
      description: t('plans.business.description'),
      monthlyPrice: 199,
      yearlyPrice: 159,
      highlight: false,
      features: [
        t('plans.business.features.clients'),
        t('plans.business.features.services'),
        t('plans.business.features.pricingPlans'),
        t('plans.business.features.teamMembers'),
        t('plans.business.features.support'),
      ],
    },
  ]

  return (
    <section className="bg-background py-24" id="pricing">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="mx-auto max-w-[490px] text-center">
          <h2 className="text-3xl font-medium tracking-[-0.05em]">Pricing</h2>
          <p className="mt-4 text-muted-foreground">
            Our pricing is built to support every stage of your studio’s
            journey—from your first bookings to fully booked weeks.
          </p>
          <div className="mt-6 inline-flex items-center justify-center gap-1 rounded-full bg-muted p-1 text-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "relative rounded-full px-5 py-2 font-medium transition-colors duration-200",
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pay monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "relative rounded-full px-5 py-2 font-medium transition-colors duration-200",
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pay yearly <span className="text-[10px]">-20%</span>
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Save up to 34% paying yearly
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card key={plan.name} className="border-border/60 bg-background p-6">
              <div className="mb-3">
                {plan.highlight ? (
                  <Badge variant="success">{t('mostPopular')}</Badge>
                ) : (
                  <div className="h-5" />
                )}
              </div>
              <div className="text-sm font-medium">{plan.name}</div>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-0.5 text-2xl font-medium">
                <NumberFlow
                  value={
                    billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
                  }
                  format={{
                    style: "currency",
                    currency: "EUR",
                    trailingZeroDisplay: "stripIfInteger",
                  }}
                  plugins={[continuous]}
                />
              </div>
              <div className="text-xs text-muted-foreground h-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={billingCycle}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {billingCycle === "yearly"
                      ? t('perMonthBilledYearly')
                      : t('perMonthBilledMonthly')}
                  </motion.div>
                </AnimatePresence>
              </div>
              <Button className="mt-5 w-full">{t('startFreeTrial')}</Button>
              <ul className="mt-5 space-y-2 text-xs text-foreground/90">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-[10px] text-foreground/70">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
