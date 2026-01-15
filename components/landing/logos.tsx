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
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex items-center justify-center rounded-full border border-border/60 bg-muted px-4 py-2 text-sm font-medium text-foreground/80"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { LogosSection }
