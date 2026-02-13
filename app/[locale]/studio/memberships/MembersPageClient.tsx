'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatAmount, formatDate } from '@/lib/utils'
import {
  Search, Users, Calendar, Clock, LogIn, Hash,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import { Link } from '@/i18n/routing'
import { checkInMembership, getMembershipByIdForCheckIn } from '@/lib/actions/memberships'
import type { MembershipWithRelations } from '@/lib/data/memberships'

interface MembersPageClientProps {
  studioId: number
  memberships: MembershipWithRelations[]
  lastCheckIns: Record<number, string>
  initialTab?: string
  initialMembershipId?: string
}

export function MembersPageClient({
  studioId,
  memberships: initialMemberships,
  lastCheckIns,
  initialTab = 'members',
  initialMembershipId,
}: MembersPageClientProps) {
  const t = useTranslations('studio.memberships.active')
  const tCheckin = useTranslations('studio.memberships.checkin')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()

  // Members list state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all')

  // Check-in state
  const [isPending, startTransition] = useTransition()
  const [membershipIdInput, setMembershipIdInput] = useState(initialMembershipId ?? '')
  const [checkinSearchQuery, setCheckinSearchQuery] = useState('')
  const [lastCheckInResult, setLastCheckInResult] = useState<{
    success: boolean
    message: string
    studentName?: string
  } | null>(null)

  useEffect(() => {
    if (initialMembershipId) {
      setMembershipIdInput(initialMembershipId)
    }
  }, [initialMembershipId])

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

  // Check-in handler
  const handleMembershipIdCheckIn = async () => {
    const trimmed = membershipIdInput.trim()
    if (!trimmed) {
      toast.error(tCheckin('toast.idRequired'))
      return
    }
    const membershipId = parseInt(trimmed, 10)
    if (isNaN(membershipId) || membershipId <= 0) {
      toast.error(tCheckin('toast.idInvalid'))
      return
    }

    startTransition(async () => {
      const membershipResult = await getMembershipByIdForCheckIn({
        membership_id: membershipId,
        studio_id: studioId,
      })

      if (!membershipResult.success) {
        setLastCheckInResult({ success: false, message: membershipResult.error })
        toast.error(membershipResult.error)
        return
      }

      const checkInResult = await checkInMembership({
        membership_id: membershipResult.data.id,
        check_in_method: 'student_qr',
        checked_by: null,
      })

      if (!checkInResult.success) {
        setLastCheckInResult({ success: false, message: checkInResult.error })
        toast.error(checkInResult.error)
        return
      }

      setLastCheckInResult({
        success: true,
        message: tCheckin('toast.checkInSuccessGeneric'),
        studentName: membershipResult.data.student_name || undefined,
      })
      toast.success(tCheckin('toast.checkInSuccess', { name: membershipResult.data.student_name || 'member' }))
      setMembershipIdInput('')
      router.refresh()
    })
  }

  const handleManualCheckIn = async () => {
    toast.info(tCheckin('qr.comingSoon'))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">{t('tabMembers')}</TabsTrigger>
          <TabsTrigger value="checkin">{t('tabCheckIn')}</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Members List */}
          {filteredMemberships.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredMemberships.map((membership) => {
                    const isExpired = new Date(membership.expires_at) < new Date()
                    const isActive = membership.status === 'active' && !isExpired
                    const lastCI = lastCheckIns[membership.id]

                    return (
                      <div
                        key={membership.id}
                        className="p-4 sm:p-6 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
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
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
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
                                  {lastCI
                                    ? t('card.lastCheckIn', { date: formatDate(new Date(lastCI)) })
                                    : t('card.neverCheckedIn')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isActive && (
                            <Button variant="outline" size="sm" className="shrink-0" asChild>
                              <Link href={`/studio/memberships?tab=checkin&id=${membership.id}`}>
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
        </TabsContent>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          <Tabs defaultValue="id" className="space-y-6">
            <TabsList>
              <TabsTrigger value="id">{tCheckin('tabs.membershipId')}</TabsTrigger>
              <TabsTrigger value="manual">{tCheckin('tabs.manual')}</TabsTrigger>
            </TabsList>

            <TabsContent value="id" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{tCheckin('membershipId.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="membership-id">{tCheckin('membershipId.label')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="membership-id"
                        type="text"
                        inputMode="numeric"
                        placeholder={tCheckin('membershipId.placeholder')}
                        value={membershipIdInput}
                        onChange={(e) => setMembershipIdInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleMembershipIdCheckIn()
                        }}
                        disabled={isPending}
                      />
                      <Button onClick={handleMembershipIdCheckIn} disabled={isPending || !membershipIdInput.trim()}>
                        <Hash className="h-4 w-4 mr-2" />
                        {tCheckin('membershipId.button')}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tCheckin('membershipId.instruction')}
                    </p>
                  </div>

                  {lastCheckInResult && (
                    <div
                      className={`p-4 rounded-lg border ${
                        lastCheckInResult.success
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lastCheckInResult.success ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <p
                            className={`font-medium ${
                              lastCheckInResult.success
                                ? 'text-green-900 dark:text-green-100'
                                : 'text-red-900 dark:text-red-100'
                            }`}
                          >
                            {lastCheckInResult.message}
                          </p>
                          {lastCheckInResult.studentName && (
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {tCheckin('membershipId.member')} {lastCheckInResult.studentName}
                            </p>
                          )}
                          {lastCheckInResult.success && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {tCheckin('membershipId.checkedInAt')} {formatDate(new Date())}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{tCheckin('tabs.manual')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin-search">{tCheckin('qr.searchMember')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="checkin-search"
                        placeholder={tCheckin('qr.searchPlaceholder')}
                        value={checkinSearchQuery}
                        onChange={(e) => setCheckinSearchQuery(e.target.value)}
                      />
                      <Button onClick={handleManualCheckIn} disabled={isPending || !checkinSearchQuery.trim()}>
                        <Search className="h-4 w-4 mr-2" />
                        {tCommon('search')}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tCheckin('qr.manualDescription')}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
