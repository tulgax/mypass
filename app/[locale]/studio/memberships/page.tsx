import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembersPageClient } from './MembersPageClient'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import {
  getActiveMemberships,
  getLastCheckInsForMemberships,
} from '@/lib/data/memberships'

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; id?: string }>
}) {
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

  const params = await searchParams
  const initialTab = params.tab === 'checkin' ? 'checkin' : 'members'
  const initialMembershipId = params.id ?? undefined

  return (
    <MembersPageClient
      studioId={studio.id}
      memberships={memberships}
      lastCheckIns={lastCheckIns}
      initialTab={initialTab}
      initialMembershipId={initialMembershipId}
    />
  )
}
