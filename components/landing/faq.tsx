import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    question: "Do I need to install an app?",
    answer:
      "No. Clients book from your public page and manage their schedule in a browser.",
  },
  {
    question: "Can I sell memberships and packs?",
    answer:
      "Yes. Set up memberships, class packs, and drop-ins with flexible pricing.",
  },
  {
    question: "Do you support online and in-person classes?",
    answer:
      "Yes. Offer virtual or studio classes with a unified schedule and checkout.",
  },
]

function FaqSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-medium tracking-[-0.05em]">FAQ</h2>
          <p className="mt-4 text-muted-foreground">
            Quick answers to common questions.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {faqs.map((faq) => (
            <Card key={faq.question} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {faq.answer}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
