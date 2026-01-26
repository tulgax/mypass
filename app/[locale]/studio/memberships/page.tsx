import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembershipsClient } from './MembershipsClient'
import { getStudioBasicInfo } from '@/lib/data/studios'
import { getActiveMemberships } from '@/lib/data/memberships'

export default async function MembershipsPage() {
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

  const memberships = await getActiveMemberships(studio.id)

  return <MembershipsClient memberships={memberships} />
}
