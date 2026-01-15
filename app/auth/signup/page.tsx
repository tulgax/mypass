import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProfileUpdate = { role: 'studio_owner' | 'student'; full_name: string }

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  async function signUp(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'studio_owner' | 'student'
    const fullName = formData.get('full_name') as string

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      redirect('/auth/signup?message=Could not create account')
    }

    if (authData.user) {
      // Update user profile with role and name
      // NOTE: Supabase typed table inference is currently failing (infers `never`)
      // during Next build. Cast to avoid blocking compilation.
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update({ role, full_name: fullName } as ProfileUpdate)
        .eq('id', authData.user.id)

      if (profileError) {
        redirect('/auth/signup?message=Could not create profile')
      }

      if (role === 'studio_owner') {
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
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" type="text" placeholder="John Doe" required />
            </div>
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select name="role" required defaultValue="student">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="studio_owner">Studio Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {searchParams?.message && (
              <p className="text-destructive text-sm">{searchParams.message}</p>
            )}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
