"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import NumberFlow, { continuous } from "@number-flow/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    description: "For solo trainers.",
    monthlyPrice: 29,
    yearlyPrice: 19,
    highlight: false,
    features: [
      "50 Active clients",
      "5 Services",
      "5 Pricing plans",
      "Team members",
      "Email support",
    ],
  },
  {
    name: "Growth",
    description: "For growing studios.",
    monthlyPrice: 59,
    yearlyPrice: 49,
    highlight: true,
    features: [
      "100 Active clients",
      "Unlimited services",
      "Unlimited pricing plans",
      "5 team members",
      "Email support",
    ],
  },
  {
    name: "Professional",
    description: "For studios ready to scale.",
    monthlyPrice: 99,
    yearlyPrice: 79,
    highlight: false,
    features: [
      "200 Active clients",
      "Unlimited services",
      "Unlimited pricing plans",
      "Unlimited team members",
      "Priority email support",
    ],
  },
  {
    name: "Business",
    description: "For large studios.",
    monthlyPrice: 199,
    yearlyPrice: 159,
    highlight: false,
    features: [
      "Unlimited active clients",
      "Unlimited services",
      "Unlimited pricing plans",
      "Unlimited team members",
      "Priority email support",
    ],
  },
]

function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

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
                  <Badge variant="success">Most popular</Badge>
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
                      ? "Per month, billed yearly"
                      : "Per month, billed monthly"}
                  </motion.div>
                </AnimatePresence>
              </div>
              <Button className="mt-5 w-full">Start free trial</Button>
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
