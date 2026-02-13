import { redirect } from 'next/navigation'

export default async function PaymentsSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/studio/settings/billing`)
}
