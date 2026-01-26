import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembershipClient } from './MembershipClient'
import { getStudioBasicInfo } from '@/lib/data/studios'
import { getMembershipPlans } from '@/lib/data/memberships'

export default async function MembershipPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const studio = await getStudioBasicInfo(user.id)

  if (!studio) {
    notFound()
  }

  const plans = await getMembershipPlans(studio.id)

  return <MembershipClient plans={plans} />
}
