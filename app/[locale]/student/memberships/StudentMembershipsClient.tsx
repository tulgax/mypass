'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatAmount, formatDate } from '@/lib/utils'
import { Calendar, Clock, MapPin, QrCode } from 'lucide-react'
import type { MembershipWithRelations } from '@/lib/data/memberships'
import { MembershipQRDisplay } from '@/components/student/MembershipQRDisplay'

interface StudentMembershipsClientProps {
  memberships: MembershipWithRelations[]
}

export function StudentMembershipsClient({ memberships }: StudentMembershipsClientProps) {
  const router = useRouter()
  const [selectedMembership, setSelectedMembership] = useState<MembershipWithRelations | null>(
    memberships.find((m) => m.status === 'active' && new Date(m.expires_at) > new Date()) || null
  )

  const activeMemberships = memberships.filter(
    (m) => m.status === 'active' && new Date(m.expires_at) > new Date()
  )
  const expiredMemberships = memberships.filter(
    (m) => m.status === 'expired' || new Date(m.expires_at) <= new Date()
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Memberships</h1>
          <p className="text-sm text-muted-foreground">View your active gym memberships</p>
        </div>
        <Button onClick={() => router.push('/student/explore')}>
          Purchase Membership
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeMemberships.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({expiredMemberships.length})
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
                        <Badge variant="default">Active</Badge>
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
                        <QrCode className="h-4 w-4 mr-2" />
                        {isSelected ? 'Selected' : 'Show QR Code'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No active memberships</p>
                <Button onClick={() => router.push('/student/explore')}>
                  Browse Gyms
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedMembership && selectedMembership.qr_code && (
            <Card>
              <CardHeader>
                <CardTitle>Check-In QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <MembershipQRDisplay
                  qrCode={selectedMembership.qr_code}
                  membershipId={selectedMembership.id}
                />
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
                        <Badge variant="secondary">Expired</Badge>
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
                        onClick={() => router.push('/student/explore')}
                      >
                        Renew Membership
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No expired memberships</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
