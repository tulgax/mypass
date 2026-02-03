'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatAmount, formatDate } from '@/lib/utils'
import { Calendar, Clock, Hash, Loader2, MapPin } from 'lucide-react'
import type { MembershipWithRelations } from '@/lib/data/memberships'
import { MembershipQRDisplay } from '@/components/student/MembershipQRDisplay'
import { purchaseMembership } from '@/lib/actions/memberships'
import { toast } from 'sonner'

interface StudentMembershipsClientProps {
  memberships: MembershipWithRelations[]
}

export function StudentMembershipsClient({ memberships }: StudentMembershipsClientProps) {
  const router = useRouter()
  const t = useTranslations('student.memberships')
  const [selectedMembership, setSelectedMembership] = useState<MembershipWithRelations | null>(
    memberships.find((m) => m.status === 'active' && new Date(m.expires_at) > new Date()) || null
  )
  const [renewMembership, setRenewMembership] = useState<MembershipWithRelations | null>(null)
  const [isRenewing, setIsRenewing] = useState(false)

  const activeMemberships = memberships.filter(
    (m) => m.status === 'active' && new Date(m.expires_at) > new Date()
  )
  const expiredMemberships = memberships.filter(
    (m) => m.status === 'expired' || new Date(m.expires_at) <= new Date()
  )

  const handleContinueSubscription = async () => {
    if (!renewMembership?.membership_plan_id || !renewMembership?.studio_id) return
    setIsRenewing(true)
    try {
      const result = await purchaseMembership({
        membership_plan_id: renewMembership.membership_plan_id,
        studio_id: renewMembership.studio_id,
      })
      if (result.success) {
        toast.success(t('renewSuccess'))
        setRenewMembership(null)
        router.refresh()
      } else {
        toast.error(result.error || t('renewError'))
      }
    } catch {
      toast.error(t('renewError'))
    } finally {
      setIsRenewing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/student/explore')}>
          {t('purchaseMembership')}
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            {t('active')} ({activeMemberships.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            {t('expired')} ({expiredMemberships.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeMemberships.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {activeMemberships.map((membership) => {
                const isSelected = selectedMembership?.id === membership.id
                const expiresAt = new Date(membership.expires_at)
                const daysRemaining = Math.ceil(
                  (expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )

                return (
                  <Card key={membership.id} className={isSelected ? 'ring-2 ring-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{membership.membership_plans?.name || 'Membership'}</CardTitle>
                        <Badge variant="default">{t('active')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{membership.studios?.name || 'Gym'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Expires: {formatDate(expiresAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {daysRemaining > 0
                              ? `${daysRemaining} days remaining`
                              : 'Expires today'}
                          </span>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatAmount(
                            membership.membership_plans?.price || 0,
                            membership.membership_plans?.currency || 'MNT'
                          )}
                        </div>
                      </div>
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedMembership(membership)}
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        {isSelected ? t('selected') : t('showCheckInId')}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">{t('noActive')}</p>
                <Button onClick={() => router.push('/student/explore')}>
                  {t('browseGyms')}
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedMembership && (
            <Card>
              <CardHeader>
                <CardTitle>{t('checkInId')}</CardTitle>
              </CardHeader>
              <CardContent>
                <MembershipQRDisplay membershipId={selectedMembership.id} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          {expiredMemberships.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {expiredMemberships.map((membership) => {
                const expiresAt = new Date(membership.expires_at)

                return (
                  <Card key={membership.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{membership.membership_plans?.name || 'Membership'}</CardTitle>
                        <Badge variant="secondary">{t('expired')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{membership.studios?.name || 'Gym'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Expired: {formatDate(expiresAt)}</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {formatAmount(
                            membership.membership_plans?.price || 0,
                            membership.membership_plans?.currency || 'MNT'
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setRenewMembership(membership)}
                      >
                        {t('continueSubscription')}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t('noExpired')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!renewMembership} onOpenChange={(open) => !open && setRenewMembership(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('renewDialogTitle')}</DialogTitle>
            <DialogDescription>{t('renewDialogDescription')}</DialogDescription>
          </DialogHeader>
          {renewMembership && (
            <div className="space-y-4 py-4">
              <div>
                <p className="font-medium">{renewMembership.membership_plans?.name || 'Membership'}</p>
                <p className="text-sm text-muted-foreground">
                  {renewMembership.studios?.name}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {formatAmount(
                    renewMembership.membership_plans?.price || 0,
                    renewMembership.membership_plans?.currency || 'MNT'
                  )}
                  {renewMembership.membership_plans?.duration_months === 1
                    ? ` / ${t('perMonth')}`
                    : renewMembership.membership_plans?.duration_months === 12
                      ? ` / ${t('perYear')}`
                      : ` / ${renewMembership.membership_plans?.duration_months} ${t('months')}`}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenewMembership(null)}
              disabled={isRenewing}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleContinueSubscription} disabled={isRenewing}>
              {isRenewing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('pay')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
