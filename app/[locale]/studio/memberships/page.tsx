import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembershipsClient } from './MembershipsClient'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import {
  getActiveMemberships,
  getLastCheckInsForMemberships,
} from '@/lib/data/memberships'

export default async function MembershipsPage() {
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

  const memberships = await getActiveMemberships(studio.id)
  const membershipIds = memberships.map((m) => m.id)
  const lastCheckIns = await getLastCheckInsForMemberships(membershipIds)

  return (
    <MembershipsClient
      memberships={memberships}
      lastCheckIns={lastCheckIns}
    />
  )
}
