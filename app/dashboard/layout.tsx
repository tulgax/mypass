import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'studio_owner') {
    redirect('/student')
  }

  const { data: studio } = await supabase
    .from('studios')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/signin')
  }

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <DashboardShell 
      hasStudio={!!studio} 
      onSignOut={signOut}
      user={{
        name: userProfile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: userProfile?.avatar_url || '',
      }}
    >
      {!studio && (
        <div className="mb-4 rounded-lg border bg-muted p-4">
          <p className="mb-2 font-medium">Create your studio to get started</p>
          <a
            href="/dashboard/studio/new"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
          >
            Create Studio
          </a>
        </div>
      )}
      {children}
    </DashboardShell>
  )
}
