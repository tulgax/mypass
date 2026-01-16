import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n/routing'

interface StudioPageProps {
  params: Promise<{ locale: string }>
}

export default async function StudioPage({ params }: StudioPageProps) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  
  // Redirect to overview page
  redirect(`/${locale}/studio/overview`)
}
