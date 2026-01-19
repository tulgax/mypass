import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './ScheduleClient'

export default async function SchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!studio) {
    notFound()
  }

  // Get all classes for this studio (needed for schedule form)
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, duration_minutes, is_active')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false })

  // Get upcoming class instances (not cancelled, scheduled in the future)
  const now = new Date().toISOString()
  const { data: instances } = await supabase
    .from('class_instances')
    .select(`
      *,
      classes (
        name,
        capacity,
        type
      )
    `)
    .in('class_id', (classes || []).map((c: { id: number }) => c.id))
    .eq('is_cancelled', false)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })

  return <ScheduleClient instances={instances || []} classes={classes || []} />
}
