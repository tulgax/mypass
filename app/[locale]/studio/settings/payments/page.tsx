import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function PaymentsSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">Manage your payment methods and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Add or remove payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">No payment methods added yet</p>
          <Button>Add Payment Method</Button>
        </CardContent>
      </Card>
    </div>
  )
}
