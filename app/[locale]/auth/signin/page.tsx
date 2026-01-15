import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignInPageClient } from '@/components/auth/signin-page-client'
import { getTranslations } from 'next-intl/server'

type ProfileRole = { role: 'studio_owner' | 'student' }

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: { message?: string }
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.signIn' })
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = (await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()) as { data: ProfileRole | null }

    if (profile?.role === 'studio_owner') {
      redirect(`/${locale}/dashboard`)
    } else {
      redirect(`/${locale}/student`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/black.svg"
              alt="MyPass"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-lg font-medium">{t('title')}</h1>
        </div>

        <SignInPageClient initialError={searchParams?.message} />

        {/* Legal Text */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            {t('terms')}
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t('privacy')}
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Powered by{' '}
          <Link href="/" className="font-medium hover:text-foreground">
            {t('mypass')}
          </Link>
        </p>
      </div>
    </div>
  )
}
