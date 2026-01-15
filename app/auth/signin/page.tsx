import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            {searchParams?.message && (
              <p className="text-destructive text-sm">{searchParams.message}</p>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
