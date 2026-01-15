'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/types/database'

type Studio = Tables<'studios'>
type StudioWithClasses = Studio & {
  classes: Array<Tables<'classes'> & { class_instances: Tables<'class_instances'>[] }>
}

export function useStudio(slug: string) {
  const [studio, setStudio] = useState<StudioWithClasses | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStudio() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch studio
        const { data: studioData, error: studioError } = await supabase
          .from('studios')
          .select('*')
          .eq('slug', slug)
          .single()

        if (studioError) throw studioError
        if (!studioData) {
          setStudio(null)
          setLoading(false)
          return
        }

        // Fetch classes with instances
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select(`
            *,
            class_instances (*)
          `)
          .eq('studio_id', studioData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (classesError) throw classesError

        setStudio({
          ...studioData,
          classes: (classesData || []) as StudioWithClasses['classes'],
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch studio'))
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchStudio()
    }
  }, [slug])

  return { studio, loading, error }
}
