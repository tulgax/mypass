import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClassesClient } from './ClassesClient'

export default async function ClassesPage() {
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

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('studio_id', studio?.id)
    .order('created_at', { ascending: false })

  return <ClassesClient classes={classes || []} />
}
