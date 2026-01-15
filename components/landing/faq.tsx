import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Do I need to install an app for my clients?",
    answer:
      "No installation required. Your clients can book classes directly from your public studio page using any web browser on their phone, tablet, or computer. The booking experience is optimized for mobile devices, so it feels like a native app without the need to download anything. Clients can manage their bookings, view their class history, and purchase memberships or class packs all from their browser.",
  },
  {
    question: "Can I sell memberships, class packs, and drop-in sessions?",
    answer:
      "Yes, absolutely. MyPass supports flexible pricing models to match your business needs. You can create unlimited membership plans (monthly, annual, or custom billing cycles), class packs with different session counts, and one-time drop-in rates. Set up automatic renewals for memberships, expiration dates for class packs, and customize pricing for different class types or time slots. All payments are processed securely online, and you can also accept in-person payments.",
  },
  {
    question: "Do you support both online and in-person classes?",
    answer:
      "Yes. MyPass is designed to handle both virtual and in-person classes seamlessly. For online classes, you can add video call links (Zoom, Google Meet, etc.) that are automatically sent to clients when they book. For in-person classes, clients receive location details and can check in using QR codes when they arrive. You can even offer hybrid options where clients choose their preferred format when booking.",
  },
  {
    question: "How quickly can I get started?",
    answer:
      "You can start taking bookings in under 30 minutes. Simply create your studio profile, add your classes and services, set up your pricing plans, and share your public booking page. The setup process is straightforward and doesn't require any technical knowledge. If you need help, our support team is available to guide you through the initial setup.",
  },
  {
    question: "Can I manage multiple instructors and team members?",
    answer:
      "Yes. MyPass supports team management features that allow you to add multiple instructors, assign them to specific classes, and manage their schedules independently. Each instructor can have their own profile, and clients can filter classes by instructor when booking. You can set different permissions for team members, from full admin access to limited scheduling capabilities.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "MyPass integrates with major payment processors to accept credit cards, debit cards, and digital wallets. Payments are processed securely and automatically, with funds deposited directly to your account. You can also enable manual payment options for clients who prefer to pay in cash or via other methods. All transactions are PCI-compliant and secure.",
  },
  {
    question: "How do clients check in for classes?",
    answer:
      "Clients receive a unique QR code when they book a class, which they can access from their booking confirmation email or their account dashboard. When they arrive at your studio, simply scan their QR code using any device (phone, tablet, or dedicated scanner) to check them in instantly. This eliminates the need for paper sign-in sheets and helps you track attendance automatically.",
  },
  {
    question: "Can I customize my booking page to match my brand?",
    answer:
      "Yes. Your public booking page can be customized with your studio's branding, including your logo, colors, and imagery. You can add your studio description, photos, and class descriptions to create a professional booking experience that reflects your brand identity. The page is mobile-responsive and optimized for conversions.",
  },
  {
    question: "What happens if a client cancels or doesn't show up?",
    answer:
      "You can set up cancellation policies with automatic refund rules based on how far in advance clients cancel. For no-shows, you can configure automatic charges or mark sessions as used from their class pack. The system sends automatic reminder emails to reduce no-shows, and you can manually adjust bookings or issue refunds as needed from your dashboard.",
  },
  {
    question: "Is there a limit on how many classes or clients I can have?",
    answer:
      "Pricing plans vary based on your needs. Starter plans are perfect for solo trainers with up to 50 active clients, while Business plans support unlimited clients and classes. All plans include unlimited services and pricing plans, so you can offer as many class types as you want. You can upgrade or downgrade your plan at any time as your studio grows.",
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
        <div className="mt-10 mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
