import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  {
    title: "Let clients purchase your offerings in seconds",
    description:
      "We’ve designed a checkout flow your clients will love—quick, intuitive, and built for conversions.",
    bullets: [
      "Sell memberships, packs, and drop-in sessions",
      "Accept payments online or in person",
      "Track client purchases and payment history",
    ],
    cta: "Accept Payments",
    image:
      "https://assets.ycodeapp.com/assets/app83049/Images/published/pilates-studio-profile-pricing-fxqe4k9vnj.webp",
  },
  {
    title: "A clear view of your business schedule",
    description:
      "Keep everything organized in one place. View upcoming classes and appointments, see who’s booked, and track payments.",
    bullets: [],
    cta: "Explore Class Scheduling",
    image:
      "https://assets.ycodeapp.com/assets/app83049/Images/published/schedule-details-cgabdlpety.webp",
  },
  {
    title: "Manage clients seamlessly",
    description:
      "Easily manage all your clients in one place. See their contact details, track purchased plans, and review visits.",
    bullets: [
      "See their memberships and class packs",
      "View upcoming and past appointments",
      "Track full payment history",
    ],
    cta: null,
    image:
      "https://assets.ycodeapp.com/assets/app83049/Images/published/pilates-studio-client-dialog-5h9cheh09v.webp",
  },
]

function FeaturesSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] space-y-14 px-6 md:px-8">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`grid items-center gap-14 lg:grid-cols-2 ${
              index % 2 === 1 ? "lg:[direction:rtl]" : ""
            }`}
          >
            <div className={index % 2 === 1 ? "lg:[direction:ltr]" : ""}>
              <h2 className="text-3xl font-medium tracking-[-0.05em]">
                {feature.title}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {feature.description}
              </p>
              {feature.bullets.length > 0 && (
                <ul className="mt-6 space-y-3 text-sm text-foreground/90">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                        ✓
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
              {feature.cta && (
                <div className="mt-6">
                  <Button variant="secondary">{feature.cta}</Button>
                </div>
              )}
            </div>
            <Card
              className={`overflow-hidden border-border/60 bg-muted ${
                index % 2 === 1 ? "lg:[direction:ltr]" : ""
              }`}
            >
              <div className="flex items-end justify-center px-10 pt-10">
                <img
                  src={feature.image}
                  alt={feature.title}
                  loading="lazy"
                  className="max-h-[520px] w-full rounded-t-xl object-cover"
                />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}

export { FeaturesSection }
