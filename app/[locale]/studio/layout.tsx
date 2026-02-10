import { redirect as nextRedirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Studio Layout
 * 
 * Handles authentication, authorization, and provides the studio shell.
 * Redirects unauthenticated users to sign in.
 * Redirects non-studio-owners to the student dashboard.
 */
export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const resolvedParams = await params
  const locale = resolvedParams.locale as Locale
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    nextRedirect(`/${locale}/auth/signin`)
  }

  // Fetch user profile for role check
  // Use maybeSingle() instead of single() to handle missing profiles gracefully
  // Note: email is not in user_profiles table, it's in auth.users
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Handle profile fetch errors
  if (profileError) {
    // Log detailed error information
    console.error('[Dashboard Layout] Profile fetch error details:', JSON.stringify(profileError, null, 2))
    console.error('[Dashboard Layout] Error type:', typeof profileError)
    console.error('[Dashboard Layout] Error keys:', Object.keys(profileError || {}))
    console.error('[Dashboard Layout] User ID:', user.id)
    console.error('[Dashboard Layout] User email:', user.email)
    
    // Check for specific error codes
    // PGRST116 = no rows returned (shouldn't happen with maybeSingle, but handle it)
    // Other codes might indicate RLS policy issues
    if (profileError.code === 'PGRST116' || profileError.code === '42P01') {
      // No rows found or table doesn't exist - profile needs to be created
      console.warn('[Dashboard Layout] Profile not found, user needs to complete signup')
      nextRedirect(`/${locale}/auth/signup`)
    } else {
      // Other errors (RLS, permissions, etc.) - redirect to sign in
      console.error('[Dashboard Layout] Unexpected profile error, redirecting to sign in')
      nextRedirect(`/${locale}/auth/signin`)
    }
  }

  // If profile doesn't exist (no error, just no data), redirect to signup
  if (!profile && !profileError) {
    console.warn('[Dashboard Layout] Profile not found for user:', user.id)
    console.warn('[Dashboard Layout] User should complete signup - redirecting')
    nextRedirect(`/${locale}/auth/signup`)
  }

  // Resolve studio access: owner (studios.owner_id) or team member (studio_team_members)
  const { studio, role } = await getStudioAndRoleForUser(user.id)
  if (!studio) {
    // User is not owner nor team member of any studio -> redirect to student
    nextRedirect(`/${locale}/student`)
  }

  // Server action for sign out
  async function signOut() {
    'use server'
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || headersList.get('referer') || ''
    // Extract locale from pathname or use default
    const pathSegments = pathname.split('/').filter(Boolean)
    const detectedLocale = pathSegments[0] && routing.locales.includes(pathSegments[0] as Locale)
      ? pathSegments[0] as Locale
      : routing.defaultLocale
    
    const client = await createClient()
    await client.auth.signOut()
    nextRedirect(`/${detectedLocale}/auth/signin`)
  }

  // Prepare user data for dashboard
  const userData = {
    name: profile?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: profile?.avatar_url || '',
  }

  return (
    <DashboardShell
      locale={locale}
      studioName={studio.name}
      studioId={studio.id}
      studioRole={role ?? 'owner'}
      onSignOut={signOut}
      user={userData}
    >
      {children}
    </DashboardShell>
  )
}
