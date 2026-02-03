'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { checkInMembership, getMembershipByIdForCheckIn } from '@/lib/actions/memberships'
import { Hash, Search, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CheckInClientProps {
  studioId: number
  initialMembershipId?: string
}

export function CheckInClient({ studioId, initialMembershipId }: CheckInClientProps) {
  const t = useTranslations('studio.memberships.checkin')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [membershipIdInput, setMembershipIdInput] = useState(initialMembershipId ?? '')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (initialMembershipId) {
      setMembershipIdInput(initialMembershipId)
    }
  }, [initialMembershipId])
  const [lastCheckIn, setLastCheckIn] = useState<{
    success: boolean
    message: string
    studentName?: string
  } | null>(null)

  const handleMembershipIdCheckIn = async () => {
    const trimmed = membershipIdInput.trim()
    if (!trimmed) {
      toast.error(t('toast.idRequired'))
      return
    }
    const membershipId = parseInt(trimmed, 10)
    if (isNaN(membershipId) || membershipId <= 0) {
      toast.error(t('toast.idInvalid'))
      return
    }

    startTransition(async () => {
      const membershipResult = await getMembershipByIdForCheckIn({
        membership_id: membershipId,
        studio_id: studioId,
      })

      if (!membershipResult.success) {
        setLastCheckIn({
          success: false,
          message: membershipResult.error,
        })
        toast.error(membershipResult.error)
        return
      }

      const checkInResult = await checkInMembership({
        membership_id: membershipResult.data.id,
        check_in_method: 'student_qr',
        checked_by: null,
      })

      if (!checkInResult.success) {
        setLastCheckIn({
          success: false,
          message: checkInResult.error,
        })
        toast.error(checkInResult.error)
        return
      }

      setLastCheckIn({
        success: true,
        message: t('toast.checkInSuccessGeneric'),
        studentName: membershipResult.data.student_name || undefined,
      })
      toast.success(t('toast.checkInSuccess', { name: membershipResult.data.student_name || 'member' }))
      setMembershipIdInput('')
      router.refresh()
    })
  }

  const handleManualCheckIn = async () => {
    // TODO: Implement manual check-in by searching for student
    toast.info(t('qr.comingSoon'))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="id" className="space-y-6">
        <TabsList>
          <TabsTrigger value="id">{t('tabs.membershipId')}</TabsTrigger>
          <TabsTrigger value="manual">{t('tabs.manual')}</TabsTrigger>
        </TabsList>

        <TabsContent value="id" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('membershipId.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="membership-id">{t('membershipId.label')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="membership-id"
                    type="text"
                    inputMode="numeric"
                    placeholder={t('membershipId.placeholder')}
                    value={membershipIdInput}
                    onChange={(e) => setMembershipIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleMembershipIdCheckIn()
                      }
                    }}
                    disabled={isPending}
                  />
                  <Button onClick={handleMembershipIdCheckIn} disabled={isPending || !membershipIdInput.trim()}>
                    <Hash className="h-4 w-4 mr-2" />
                    {t('membershipId.button')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('membershipId.instruction')}
                </p>
              </div>

              {lastCheckIn && (
                <div
                  className={`p-4 rounded-lg border ${
                    lastCheckIn.success
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {lastCheckIn.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          lastCheckIn.success
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}
                      >
                        {lastCheckIn.message}
                      </p>
                      {lastCheckIn.studentName && (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {t('membershipId.member')} {lastCheckIn.studentName}
                        </p>
                      )}
                      {lastCheckIn.success && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {t('membershipId.checkedInAt')} {formatDate(new Date())}
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
              <CardTitle>{t('tabs.manual')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">{t('qr.searchMember')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder={t('qr.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleManualCheckIn} disabled={isPending || !searchQuery.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    {tCommon('search')}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('qr.manualDescription')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
