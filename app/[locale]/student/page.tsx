import { redirect } from 'next/navigation'

export default async function StudentPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/explore`)
}
