import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExploreHeader } from '@/components/explore/ExploreHeader'

export default async function ExploreLayout({
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

  let userData: { name: string; email: string; avatar?: string; role?: string } | null = null

  if (user) {
    // Fetch profile to determine role for correct dashboard link
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    userData = {
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User',
      email: user.email || '',
      avatar:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        '',
      role: profile?.role ?? 'student',
    }
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect(`/${locale}/auth/signin`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ExploreHeader user={userData} onSignOut={user ? signOut : undefined} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
