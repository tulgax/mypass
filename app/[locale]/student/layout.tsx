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

  // Get user profile data
  const userData = {
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
  }

  return <StudentShell user={userData} onSignOut={signOut}>{children}</StudentShell>
}
