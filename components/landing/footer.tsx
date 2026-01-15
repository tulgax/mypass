"use client"

import { StatusBadge } from "@/components/ui/status-badge"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "./language-switcher"

function FooterSection() {
  const t = useTranslations('landing.footer')
  
  const footerLinks = [
    {
      title: t('company.title'),
      items: [
        { label: t('company.contact'), href: "/contact" },
        { label: t('company.affiliate'), href: "#" },
        { label: t('company.privacy'), href: "/privacy" },
        { label: t('company.terms'), href: "/terms" },
        { label: t('company.cookies'), href: "/cookies" },
      ],
    },
    {
      title: t('product.title'),
      items: [
        { label: t('product.booking'), href: "#" },
        { label: t('product.payments'), href: "#" },
      ],
    },
    {
      title: t('resources.title'),
      items: [
        { label: t('resources.help'), href: "#" },
        { label: t('resources.blog'), href: "#" },
      ],
    },
    {
      title: t('social.title'),
      items: [
        { label: t('social.facebook'), href: "#" },
        { label: t('social.linkedin'), href: "#" },
        { label: t('social.x'), href: "#" },
        { label: t('social.youtube'), href: "#" },
      ],
    },
  ]

  const studioSolutions = [
    t('studioSolutions.yoga'),
    t('studioSolutions.crossfit'),
    t('studioSolutions.pilates'),
    t('studioSolutions.gym'),
    t('studioSolutions.boxing'),
    t('studioSolutions.personalCoach'),
  ]
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
            <h4 className="text-sm font-semibold mb-3">{t('studioSolutions.title')}</h4>
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
            <span>{t('copyright')}</span>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <StatusBadge />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { FooterSection }
