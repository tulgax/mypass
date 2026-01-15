 "use client"

import { useState } from "react"
import Link from "next/link"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const productLinks = [
  {
    label: "Class scheduling",
    description: "Set up services and schedule.",
  },
  {
    label: "Payments",
    description: "Sell memberships, packs, and drop-ins.",
  },
]

const businessLinks = [
  { label: "Pilates", description: "For pilates studios and trainers." },
  { label: "Yoga", description: "For yoga studios and yoga teachers." },
  { label: "Gym", description: "For gyms, fitness businesses, and facilities." },
  { label: "CrossFit", description: "For CrossFit gyms and fitness coaches." },
  { label: "Boxing", description: "For boxing gyms, trainers, and fight clubs." },
  { label: "Dance", description: "For dance studios and choreographers." },
  { label: "Martial arts", description: "For martial arts studios and dojos." },
  { label: "Group training", description: "For bootcamps and fitness teams." },
  { label: "Spin", description: "For spin studios and cycling clubs." },
]

function HeaderNav() {
  const [activeMenu, setActiveMenu] = useState<"product" | "business" | null>(
    null
  )

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
          <Link href="/" className="text-base font-semibold tracking-tight">
            MyPass
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-foreground/80 md:flex">
            <button
              type="button"
              data-menu="product"
              onMouseEnter={() => setActiveMenu("product")}
            className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Product
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
              Business
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                activeMenu === "business" && "rotate-180"
              )}
              style={{ transition: `transform ${spring}` }}
            />
            </button>

            <Link href="#pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-foreground">
              Help
            </Link>
            <Link href="#cta" className="hover:text-foreground">
              Refer &amp; Earn
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="default">
              Sign in
            </Button>
            <Button size="default">Sign up</Button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-200",
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
      </div>
      </header>
    </div>
  )
}

export { HeaderNav }
