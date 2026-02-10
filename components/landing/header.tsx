 "use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { ChevronDown, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function HeaderNav() {
  const t = useTranslations('landing.header')
  
  const productLinks = [
    {
      label: t('productLinks.classScheduling.label'),
      description: t('productLinks.classScheduling.description'),
    },
    {
      label: t('productLinks.payments.label'),
      description: t('productLinks.payments.description'),
    },
  ]

  const businessLinks = [
    { label: t('businessLinks.pilates.label'), description: t('businessLinks.pilates.description') },
    { label: t('businessLinks.yoga.label'), description: t('businessLinks.yoga.description') },
    { label: t('businessLinks.gym.label'), description: t('businessLinks.gym.description') },
    { label: t('businessLinks.crossfit.label'), description: t('businessLinks.crossfit.description') },
    { label: t('businessLinks.boxing.label'), description: t('businessLinks.boxing.description') },
    { label: t('businessLinks.dance.label'), description: t('businessLinks.dance.description') },
    { label: t('businessLinks.martialArts.label'), description: t('businessLinks.martialArts.description') },
    { label: t('businessLinks.groupTraining.label'), description: t('businessLinks.groupTraining.description') },
    { label: t('businessLinks.spin.label'), description: t('businessLinks.spin.description') },
  ]
  const [activeMenu, setActiveMenu] = useState<"product" | "business" | null>(
    null
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSubmenu, setMobileSubmenu] = useState<"product" | "business" | null>(null)

  const isExpanded = activeMenu !== null
  const spring = "350ms linear(0, 0.2657, 0.6492, 0.8964, 1.0028, 1.0282, 1.0223, 1.0112, 1.0036, 1.0001, 1, 1)"

  return (
    <div
      className="sticky top-0 z-50 h-16"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <header
        className={cn(
          "absolute left-0 right-0 top-0 bg-background transition-all duration-200",
          isExpanded && "shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
        )}
      >
        <div
        className={cn(
          "relative mx-auto flex w-full max-w-[1440px] flex-col px-6 md:px-8",
          isExpanded ? "pb-8" : "pb-0"
        )}
        style={{ transition: `padding ${spring}` }}
      >
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            {/* Full logo for desktop, symbol for mobile */}
            <Image
              src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/black.svg"
              alt="MyPass"
              width={120}
              height={27}
              className="hidden h-6 w-auto md:block"
              priority
            />
            <Image
              src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/symbol%20black.svg"
              alt="MyPass"
              width={40}
              height={26}
              className="h-6 w-auto md:hidden"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm text-foreground/80 md:flex">
            <button
              type="button"
              data-menu="product"
              onMouseEnter={() => setActiveMenu("product")}
              className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {t('product')}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  activeMenu === "product" && "rotate-180"
                )}
                style={{ transition: `transform ${spring}` }}
              />
            </button>

            <button
              type="button"
              data-menu="business"
              onMouseEnter={() => setActiveMenu("business")}
              className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {t('business')}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  activeMenu === "business" && "rotate-180"
                )}
                style={{ transition: `transform ${spring}` }}
              />
            </button>

            <Link href="/explore" className="hover:text-foreground">
              {t('explore')}
            </Link>
            <Link href="#pricing" className="hover:text-foreground">
              {t('pricing')}
            </Link>
            <Link href="#faq" className="hover:text-foreground">
              {t('help')}
            </Link>
            <Link href="#cta" className="hover:text-foreground">
              {t('referEarn')}
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/auth/signin">
              <Button variant="secondary" size="default">
                {t('signIn')}
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="default">{t('signUp')}</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen)
              setMobileSubmenu(null)
            }}
            className="flex items-center justify-center p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop Dropdown Menu */}
        <div
          className={cn(
            "hidden overflow-hidden transition-[max-height,opacity] duration-200 md:block",
            isExpanded ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
          )}
          style={{ transition: `max-height ${spring}, opacity 150ms linear` }}
          onMouseEnter={() => setActiveMenu(activeMenu)}
        >
          <div className="mt-2 rounded-2xl bg-background/95 px-6 py-8">
            <div
              className={cn(
                "grid gap-x-8 gap-y-6",
                activeMenu === "product" ? "grid-cols-2" : "grid-cols-3"
              )}
            >
              {activeMenu === "product" &&
                productLinks.map((item) => (
                  <div key={item.label} className="group relative rounded-lg p-3 hover:bg-muted/50 transition-colors space-y-1 cursor-pointer">
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              {activeMenu === "business" &&
                businessLinks.slice(0, 6).map((item) => (
                  <div key={item.label} className="group relative rounded-lg p-3 hover:bg-muted/50 transition-colors space-y-1 cursor-pointer">
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
          </div>
        </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-200 md:hidden",
            mobileMenuOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-border bg-background py-4">
            <nav className="flex flex-col space-y-1 px-6">
              {/* Product Menu */}
              <button
                type="button"
                onClick={() => setMobileSubmenu(mobileSubmenu === "product" ? null : "product")}
                className="flex items-center justify-between py-3 text-left text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {t('product')}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    mobileSubmenu === "product" && "rotate-180"
                  )}
                />
              </button>
              {mobileSubmenu === "product" && (
                <div className="space-y-1 pl-4 pb-2">
                  {productLinks.map((item) => (
                    <div key={item.label} className="rounded-lg py-2 px-3 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Business Menu */}
              <button
                type="button"
                onClick={() => setMobileSubmenu(mobileSubmenu === "business" ? null : "business")}
                className="flex items-center justify-between py-3 text-left text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {t('business')}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    mobileSubmenu === "business" && "rotate-180"
                  )}
                />
              </button>
              {mobileSubmenu === "business" && (
                <div className="space-y-1 pl-4 pb-2">
                  {businessLinks.map((item) => (
                    <div key={item.label} className="rounded-lg py-2 px-3 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {t('explore')}
              </Link>
              <Link
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {t('pricing')}
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {t('help')}
              </Link>
              <Link
                href="#cta"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {t('referEarn')}
              </Link>

              {/* Mobile Buttons */}
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="default" className="w-full">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="default" className="w-full">
                    {t('signUp')}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
        </div>
      </header>
    </div>
  )
}

export { HeaderNav }
