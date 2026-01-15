import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentShell } from '@/components/student/StudentShell'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  return <StudentShell onSignOut={signOut}>{children}</StudentShell>
}
