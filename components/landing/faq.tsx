"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslations } from "next-intl"

function FaqSection() {
  const t = useTranslations('landing.faq')
  
  const faqs = [
    {
      question: t('questions.appInstall.question'),
      answer: t('questions.appInstall.answer'),
    },
    {
      question: t('questions.sellMemberships.question'),
      answer: t('questions.sellMemberships.answer'),
    },
    {
      question: t('questions.onlineInPerson.question'),
      answer: t('questions.onlineInPerson.answer'),
    },
    {
      question: t('questions.getStarted.question'),
      answer: t('questions.getStarted.answer'),
    },
    {
      question: t('questions.manageInstructors.question'),
      answer: t('questions.manageInstructors.answer'),
    },
    {
      question: t('questions.paymentMethods.question'),
      answer: t('questions.paymentMethods.answer'),
    },
    {
      question: t('questions.checkIn.question'),
      answer: t('questions.checkIn.answer'),
    },
    {
      question: t('questions.customizePage.question'),
      answer: t('questions.customizePage.answer'),
    },
    {
      question: t('questions.cancellations.question'),
      answer: t('questions.cancellations.answer'),
    },
    {
      question: t('questions.limits.question'),
      answer: t('questions.limits.answer'),
    },
  ]

  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-medium tracking-[-0.05em]">{t('title')}</h2>
          <p className="mt-4 text-muted-foreground">
            {t('subtitle')}
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
