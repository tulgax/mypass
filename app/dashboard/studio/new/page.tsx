import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudioForm } from '@/components/dashboard/StudioForm'

export default async function NewStudioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Check if user already has a studio
  const { data: existingStudio } = await supabase
    .from('studios')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  if (existingStudio) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Your Studio</h1>
        <p className="text-muted-foreground">Set up your studio profile to start taking bookings</p>
      </div>
      <StudioForm />
    </div>
  )
}
