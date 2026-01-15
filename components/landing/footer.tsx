import { StatusBadge } from "@/components/ui/status-badge"
import Link from "next/link"

const footerLinks = [
  {
    title: "Company",
    items: [
      { label: "Contact us", href: "/contact" },
      { label: "Become an affiliate", href: "#" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie preferences", href: "/cookies" },
    ],
  },
  {
    title: "Product",
    items: [
      { label: "Booking & Scheduling", href: "#" },
      { label: "Payments", href: "#" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Help", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Social",
    items: [
      { label: "Facebook", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "X", href: "#" },
      { label: "Youtube", href: "#" },
    ],
  },
]

const studioSolutions = [
  "Yoga studio",
  "CrossFit",
  "Pilates",
  "Gym",
  "Boxing",
  "Personal coach",
]

function FooterSection() {
  return (
    <footer className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        {/* Links Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Company, Product, Resources, Social */}
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-sm font-semibold">{group.title}</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Studio Solutions */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Studio solutions</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {studioSolutions.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col justify-between gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
            <span>2026 © MyPass - All rights reserved.</span>
            <StatusBadge />
          </div>
        </div>
      </div>
    </footer>
  )
}

export { FooterSection }
