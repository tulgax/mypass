import { Badge } from "@/components/ui/badge"

function LogosSection() {
  const logos = [
    "Pilates",
    "Yoga",
    "Gym",
    "CrossFit",
    "Boxing",
    "Dance",
  ]

  return (
    <section className="bg-background py-16">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <p className="text-center text-sm text-muted-foreground">
          Join 1,000+ fitness businesses
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {logos.map((logo) => (
            <Badge
              key={logo}
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium"
            >
              {logo}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}

export { LogosSection }
