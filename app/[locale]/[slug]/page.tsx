import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudioPageClient } from '../studio/[slug]/StudioPageClient'
import type { Tables } from '@/lib/types/database'

type ClassInstance = Tables<'class_instances'> & {
  classes: Tables<'classes'>
}

// Reserved routes that should not be treated as studio slugs
const RESERVED_ROUTES = ['studio', 'auth', 'student', 'branding', 'contact', 'cookies', 'privacy', 'terms']

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

  const supabase = await createClient()

  // Fetch studio
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('*')
    .eq('slug', slug)
    .single()

  if (studioError || !studio) {
    notFound()
  }

  // First, get all active class IDs for this studio
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('studio_id', studio.id)
    .eq('is_active', true)

  const classIds = (classes || []).map((cls: { id: number }) => cls.id)

  // Fetch upcoming class instances with their classes
  const now = new Date().toISOString()
  const { data: instances, error: instancesError } = await supabase
    .from('class_instances')
    .select(
      `
      *,
      classes (
        *
      )
    `
    )
    .in('class_id', classIds.length > 0 ? classIds : [0]) // Empty array causes error, use [0] which won't match
    .eq('is_cancelled', false)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })

  if (instancesError) {
    console.error('Error fetching instances:', instancesError)
  }

  // Filter instances where class exists and is active
  const validInstances: ClassInstance[] = (instances || []).filter(
    (inst: any) => inst.classes && inst.classes.is_active
  ) as ClassInstance[]

  return <StudioPageClient studio={studio} classInstances={validInstances} />
}
