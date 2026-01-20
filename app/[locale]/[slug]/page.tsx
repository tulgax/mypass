import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { StudioPageClient } from '../studio/[slug]/StudioPageClient'
import { getPublicStudioWithUpcomingInstances } from '@/lib/data/public-studios'
import type { PublicStudioWithInstances } from '@/lib/types/public'
import PublicStudioLoading from './loading'

// Reserved routes that should not be treated as studio slugs
const RESERVED_ROUTES = ['studio', 'auth', 'student', 'branding', 'contact', 'cookies', 'privacy', 'terms']

async function StudioContent({ slug, locale }: { slug: string; locale: string }) {
  const data = await getPublicStudioWithUpcomingInstances(slug)

  if (!data) {
    notFound()
  }

  return <StudioPageClient studio={data} classInstances={data.classInstances} locale={locale} />
}

export default async function PublicStudioPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  
  // Check if this is a reserved route - if so, 404
  if (RESERVED_ROUTES.includes(slug)) {
    notFound()
  }

  return (
    <Suspense fallback={<PublicStudioLoading />}>
      <StudioContent slug={slug} locale={locale} />
    </Suspense>
  )
}
