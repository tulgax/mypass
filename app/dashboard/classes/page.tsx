import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils'

export default async function ClassesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('studio_id', studio?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Manage your studio classes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/classes/new">Create Class</Link>
        </Button>
      </div>

      {classes && classes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader>
                <CardTitle>{cls.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{cls.type}</Badge>
                  <Badge variant="outline">{cls.duration_minutes} min</Badge>
                  <Badge variant={cls.is_active ? 'default' : 'outline'}>
                    {cls.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm font-medium">
                  {formatAmount(cls.price, cls.currency)}
                </p>
                <p className="text-muted-foreground text-sm">Capacity: {cls.capacity}</p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/dashboard/classes/${cls.id}`}>Edit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No classes yet</p>
            <Button asChild>
              <Link href="/dashboard/classes/new">Create your first class</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
