import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentMembershipsClient } from './StudentMembershipsClient'
import { getStudentMemberships } from '@/lib/data/memberships'

export default async function StudentMembershipsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const memberships = await getStudentMemberships(user.id)

  return <StudentMembershipsClient memberships={memberships} />
}
