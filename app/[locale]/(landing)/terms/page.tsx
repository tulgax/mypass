export const metadata = {
  title: "Terms of Service - MyPass",
  description: "MyPass Terms of Service. Read our terms and conditions for using our scheduling software.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: January 15, 2026
          </p>

          <div className="mt-12 space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using MyPass, you agree to be bound by these
                Terms of Service and all applicable laws and regulations. If you
                do not agree with any of these terms, you are prohibited from
                using our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Use License
              </h2>
              <p className="mb-2">
                Permission is granted to temporarily use MyPass for personal or
                commercial business purposes. This license does not include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modifying or copying the software</li>
                <li>Using the software for any commercial purpose without authorization</li>
                <li>Removing any copyright or proprietary notations</li>
                <li>Transferring the materials to another person</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. Account Registration
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized
                use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Payment Terms
              </h2>
              <p>
                Subscription fees are billed in advance on a monthly or annual
                basis. All fees are non-refundable except as required by law.
                We reserve the right to change our pricing with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Prohibited Uses
              </h2>
              <p className="mb-2">You may not use MyPass to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful or malicious code</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Termination
              </h2>
              <p>
                We may terminate or suspend your account and access to the
                service immediately, without prior notice, for any breach of
                these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Limitation of Liability
              </h2>
              <p>
                In no event shall MyPass be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your
                use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:legal@mypass.com"
                  className="text-foreground hover:underline"
                >
                  legal@mypass.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
