import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AvailabilitySettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground">Set your working hours and availability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>Configure when your studio is available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Configure your weekly schedule</p>
          <Button>Set Availability</Button>
        </CardContent>
      </Card>
    </div>
  )
}
