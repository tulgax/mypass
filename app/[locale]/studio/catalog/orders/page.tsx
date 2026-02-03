import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import { formatAmount } from '@/lib/utils'

export default async function OrdersPage() {
  const t = await getTranslations('studio.catalog.orders')
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

  // TODO: Fetch orders from database when orders table is created
  const orders: any[] = []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('orderNumber', { id: order.id })}</CardTitle>
                  <Badge variant={order.status === 'completed' ? 'default' : 'outline'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="font-medium mt-1">
                      {formatAmount(order.total_amount, order.currency)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/studio/catalog/orders/${order.id}`}>{t('viewDetails')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <StudioEmptyState
              variant="orders"
              title={t('noOrders')}
              embedded
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
