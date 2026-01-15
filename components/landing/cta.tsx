import { Button } from "@/components/ui/button"

function CtaSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 text-center md:px-8">
        <h2 className="text-3xl font-medium tracking-[-0.05em]">
          Manage bookings and payments easier
        </h2>
        <div className="mt-6 flex items-center justify-center">
          <Button>Try 14 days for free</Button>
        </div>
      </div>
    </section>
  )
}

export { CtaSection }
