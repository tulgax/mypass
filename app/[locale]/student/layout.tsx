import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentShell } from '@/components/student/StudentShell'

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/signin`)
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect(`/${locale}/auth/signin`)
  }

  return <StudentShell onSignOut={signOut}>{children}</StudentShell>
}
