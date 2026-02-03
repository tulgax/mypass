'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatAmount, formatDate } from '@/lib/utils'
import { Search, Users, Calendar, Clock, LogIn, Hash } from 'lucide-react'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import { Link } from '@/i18n/routing'
import type { MembershipWithRelations } from '@/lib/data/memberships'

interface MembershipsClientProps {
  memberships: MembershipWithRelations[]
  lastCheckIns: Record<number, string>
}

export function MembershipsClient({
  memberships: initialMemberships,
  lastCheckIns,
}: MembershipsClientProps) {
  const t = useTranslations('studio.memberships.active')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all')

  // Filter memberships
  const filteredMemberships = initialMemberships.filter((membership) => {
    const matchesSearch =
      membership.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membership.membership_plans?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && membership.status === 'active') ||
      (statusFilter === 'expired' && membership.status === 'expired')

    return matchesSearch && matchesStatus
  })

  const activeCount = initialMemberships.filter((m) => m.status === 'active').length
  const expiredCount = initialMemberships.filter((m) => m.status === 'expired').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/studio/memberships/checkin')}>
          {t('checkIn')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            {t('filters.all')} ({initialMemberships.length})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            {t('filters.active')} ({activeCount})
          </Button>
          <Button
            variant={statusFilter === 'expired' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('expired')}
          >
            {t('filters.expired')} ({expiredCount})
          </Button>
        </div>
      </div>

      {/* Memberships List */}
      {filteredMemberships.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredMemberships.map((membership) => {
                const isExpired = new Date(membership.expires_at) < new Date()
                const isActive = membership.status === 'active' && !isExpired

                const lastCheckIn = lastCheckIns[membership.id]

                return (
                  <div
                    key={membership.id}
                    className="p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold">
                            {membership.user_profiles?.full_name || t('card.unknownMember')}
                          </h3>
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? t('card.activeBadge') : t('card.expiredBadge')}
                          </Badge>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono">
                            <Hash className="h-3.5 w-3.5" />
                            {t('card.id')} {membership.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{membership.membership_plans?.name || t('card.na')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{t('card.expires')} {formatDate(new Date(membership.expires_at))}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatAmount(
                                membership.membership_plans?.price || 0,
                                membership.membership_plans?.currency || 'MNT'
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LogIn className="h-3.5 w-3.5" />
                            <span>
                              {lastCheckIn
                                ? t('card.lastCheckIn', { date: formatDate(new Date(lastCheckIn)) })
                                : t('card.neverCheckedIn')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <Button variant="outline" size="sm" className="shrink-0" asChild>
                          <Link href={`/studio/memberships/checkin?id=${membership.id}`}>
                            {t('card.checkIn')}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <StudioEmptyState
              variant="memberships"
              title={
                searchQuery || statusFilter !== 'all'
                  ? t('empty.noMatches')
                  : t('empty.noMemberships')
              }
              embedded
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
