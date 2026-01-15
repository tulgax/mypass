export const metadata = {
  title: "Contact Us - MyPass",
  description: "Get in touch with MyPass. We're here to help with any questions about our scheduling software for fitness studios.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-muted-foreground">
            Have a question or need help? We'd love to hear from you. Send us a
            message and we'll respond as soon as possible.
          </p>

          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-xl font-semibold">Email</h2>
              <p className="mt-2 text-muted-foreground">
                <a
                  href="mailto:support@mypass.com"
                  className="hover:text-foreground transition-colors"
                >
                  support@mypass.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Support Hours</h2>
              <p className="mt-2 text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM EST
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">General Inquiries</h2>
              <p className="mt-2 text-muted-foreground">
                For general questions, partnerships, or media inquiries, please
                reach out to{" "}
                <a
                  href="mailto:hello@mypass.com"
                  className="hover:text-foreground transition-colors"
                >
                  hello@mypass.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
