import { FooterSection } from "@/components/landing/footer"
import { HeaderNav } from "@/components/landing/header"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderNav />
      {children}
      <FooterSection />
    </>
  )
}
