import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function CouponsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!studio) {
    notFound()
  }

  // TODO: Fetch coupons from database when coupons table is created
  const coupons: any[] = []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage your discount coupons</p>
        </div>
        <Button>Create Coupon</Button>
      </div>

      {coupons && coupons.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon: any) => (
            <Card key={coupon.id}>
              <CardHeader>
                <CardTitle>{coupon.code}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{coupon.discount_type}</Badge>
                  <Badge variant={coupon.is_active ? 'default' : 'outline'}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{coupon.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No coupons yet</p>
            <Button>Create your first coupon</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
