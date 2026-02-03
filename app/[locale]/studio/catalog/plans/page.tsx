import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'

export default async function PlansPage() {
  const t = await getTranslations('studio.catalog.plans')
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

  // TODO: Fetch plans from database when plans table is created
  const plans: any[] = []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button>{t('createPlan')}</Button>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: any) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <StudioEmptyState
              variant="plans"
              title={t('noPlans')}
              action={<Button>{t('createFirst')}</Button>}
              embedded
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
