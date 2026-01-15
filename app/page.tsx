import { CtaSection } from "@/components/landing/cta"
import { FaqSection } from "@/components/landing/faq"
import { FeaturesSection } from "@/components/landing/features"
import { FooterSection } from "@/components/landing/footer"
import { HeaderNav } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero"
import { LogosSection } from "@/components/landing/logos"
import { PricingSection } from "@/components/landing/pricing"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeaderNav />
      <HeroSection />
      <LogosSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}
