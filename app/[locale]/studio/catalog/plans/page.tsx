import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlansClient } from './PlansClient'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getPlans } from '@/lib/data/plans'
import { getActiveClassesByStudioId } from '@/lib/data/classes'

export default async function PlansPage() {
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

  const [plans, classes] = await Promise.all([
    getPlans(studio.id),
    getActiveClassesByStudioId(studio.id),
  ])

  return <PlansClient plans={plans} classes={classes} />
}
