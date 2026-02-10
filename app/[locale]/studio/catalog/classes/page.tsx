import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClassesClient } from './ClassesClient'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getClassesByStudioId } from '@/lib/data/classes'

export default async function ClassesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { studio } = await getStudioAndRoleForUser(user.id)

  if (!studio) {
    notFound()
  }

  const classes = await getClassesByStudioId(studio.id)

  return <ClassesClient classes={classes} />
}
