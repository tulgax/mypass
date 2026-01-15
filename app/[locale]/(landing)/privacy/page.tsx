export const metadata = {
  title: "Privacy Policy - MyPass",
  description: "MyPass Privacy Policy. Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: January 15, 2026
          </p>

          <div className="mt-12 space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Introduction
              </h2>
              <p>
                MyPass ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                scheduling software and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Information We Collect
              </h2>
              <p className="mb-2">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email address, phone number)</li>
                <li>Business information (studio name, address, services)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Client booking and scheduling data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to
                protect your personal information. However, no method of
                transmission over the Internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Your Rights
              </h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy, please contact
                us at{" "}
                <a
                  href="mailto:privacy@mypass.com"
                  className="text-foreground hover:underline"
                >
                  privacy@mypass.com
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
