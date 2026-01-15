import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

type ProfileRole = { role: 'studio_owner' | 'student' }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
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
      redirect('/dashboard')
    } else {
      redirect('/student')
    }
  }

  async function signIn(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      redirect('/auth/signin?message=Could not authenticate user')
    }

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
        redirect('/dashboard')
      } else {
        redirect('/student')
      }
    }
  }

  async function signInWithGoogle() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      redirect('/auth/signin?message=Could not authenticate with Google')
    }
    if (data.url) {
      redirect(data.url)
    }
  }

  async function signInWithFacebook() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      redirect('/auth/signin?message=Could not authenticate with Facebook')
    }
    if (data.url) {
      redirect(data.url)
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
          <h1 className="text-lg font-medium">Sign in to your account</h1>
        </div>

        {/* Social Sign-in Buttons */}
        <div className="space-y-3">
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="secondary"
              className="w-full justify-center gap-3 bg-muted hover:bg-muted/80"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          <form action={signInWithFacebook}>
            <Button
              type="submit"
              variant="secondary"
              className="w-full justify-center gap-3 bg-muted hover:bg-muted/80"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </Button>
          </form>
        </div>

        {/* Separator */}
        <div className="relative">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-sm text-muted-foreground">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form action={signIn} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              className="h-11"
            />
          </div>
          {searchParams?.message && (
            <p className="text-sm text-destructive">{searchParams.message}</p>
          )}
          <Button type="submit" className="w-full h-11">
            Continue
          </Button>
        </form>

        {/* Legal Text */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Powered by{' '}
          <Link href="/" className="font-medium hover:text-foreground">
            MyPass
          </Link>
        </p>
      </div>
    </div>
  )
}
