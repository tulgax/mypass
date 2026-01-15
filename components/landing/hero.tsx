import { Button } from "@/components/ui/button"

function HeroSection() {
  return (
    <section className="bg-background pt-20">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-14 px-6 text-center md:px-8">
        <div className="flex max-w-[780px] flex-col items-center gap-8">
          <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
            Scheduling software for fitness studios and individual instructors
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="default">Start free trial</Button>
              <Button variant="secondary" size="default">
                Book a demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Join 1,000+ fitness businesses
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {[
            "https://assets.ycodeapp.com/assets/app83049/Images/published/pilates-8yvwbwmrr8.webp",
            "https://assets.ycodeapp.com/assets/app83049/Images/published/yoga-mat-62p5ownakr.webp",
            "https://assets.ycodeapp.com/assets/app83049/Images/published/gym-anqe8msrlr.webp",
          ].map((src) => (
            <div
              key={src}
              className="h-[72px] w-[72px] overflow-hidden rounded-full bg-muted"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="w-full max-w-[1136px] overflow-hidden rounded-xl">
          <img
            src="https://assets.ycodeapp.com/assets/app83049/Images/published/scheduling-software-ny7tdkagvo.webp"
            alt="Scheduling software interface"
            className="h-[400px] w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
