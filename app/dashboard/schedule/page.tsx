import { createClient } from '@/lib/supabase/server'
import { ScheduleForm } from '@/components/dashboard/ScheduleForm'

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

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, duration_minutes, is_active')
    .eq('studio_id', studio?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">Add class sessions for students to book</p>
      </div>
      <ScheduleForm classes={classes || []} />
    </div>
  )
}
