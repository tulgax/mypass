import { redirect } from 'next/navigation'

export default async function InstructorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/studio/settings/team`)
}
