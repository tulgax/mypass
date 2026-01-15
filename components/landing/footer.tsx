import { Separator } from "@/components/ui/separator"

const footerLinks = [
  {
    title: "Company",
    items: [
      "Contact us",
      "Become an affiliate",
      "Privacy Policy",
      "Terms of Service",
      "Cookie preferences",
    ],
  },
  {
    title: "Product",
    items: ["Booking & Scheduling", "Payments"],
  },
  {
    title: "Resources",
    items: ["Help", "Blog"],
  },
  {
    title: "Compare",
    items: [
      "Best Mindbody Alternative",
      "Best Momence Alternative",
      "Best LegitFit Alternative",
    ],
  },
]

function FooterSection() {
  return (
    <footer className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <img
              src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/symbol%20grey.svg"
              alt="MyPass icon"
              className="h-8 w-8"
              loading="lazy"
            />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerLinks.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="text-sm font-semibold">{group.title}</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {group.items.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Separator className="my-10" />
        <div className="flex flex-col justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span>2026 © time2book·me - All rights reserved.</span>
          <span>Instagram</span>
        </div>
      </div>
    </footer>
  )
}

export { FooterSection }
