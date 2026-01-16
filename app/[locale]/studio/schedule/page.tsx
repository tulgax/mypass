import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './ScheduleClient'

export default async function SchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!studio) return null

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, duration_minutes, is_active')
    .eq('studio_id', studio.id)
    .order('created_at', { ascending: false })

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
    .in('class_id', (classes || []).map((c: { id: string }) => c.id))
    .order('scheduled_at', { ascending: true })

  return (
    <ScheduleClient 
      classes={classes || []} 
      instances={instances || []}
    />
  )
}
