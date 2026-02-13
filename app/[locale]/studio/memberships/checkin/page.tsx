import { redirect } from 'next/navigation'

export default async function CheckInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { locale } = await params
  const { id } = await searchParams
  const query = id ? `?tab=checkin&id=${id}` : '?tab=checkin'
  redirect(`/${locale}/studio/memberships${query}`)
}
