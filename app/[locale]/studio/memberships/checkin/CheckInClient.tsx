'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { checkInMembership, getMembershipByQRCode } from '@/lib/actions/memberships'
import { QrCode, Search, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CheckInClientProps {
  studioId: number
}

export function CheckInClient({ studioId }: CheckInClientProps) {
  const t = useTranslations('studio.memberships.checkin')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [qrCode, setQrCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [lastCheckIn, setLastCheckIn] = useState<{
    success: boolean
    message: string
    studentName?: string
  } | null>(null)

  const handleQRCheckIn = async () => {
    if (!qrCode.trim()) {
      toast.error(t('toast.qrRequired'))
      return
    }

    startTransition(async () => {
      // First, get membership by QR code
      const membershipResult = await getMembershipByQRCode({ qr_code: qrCode.trim() })

      if (!membershipResult.success) {
        setLastCheckIn({
          success: false,
          message: membershipResult.error,
        })
        toast.error(membershipResult.error)
        return
      }

      // Then check in
      const checkInResult = await checkInMembership({
        membership_id: membershipResult.data.id,
        check_in_method: 'student_qr',
        checked_by: null, // Will be set by the action
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
      setQrCode('')
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

      <Tabs defaultValue="qr" className="space-y-6">
        <TabsList>
          <TabsTrigger value="qr">{t('tabs.qrScanner')}</TabsTrigger>
          <TabsTrigger value="manual">{t('tabs.manual')}</TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('qr.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">QR Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-code"
                    placeholder={t('qr.placeholder')}
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQRCheckIn()
                      }
                    }}
                    disabled={isPending}
                  />
                  <Button onClick={handleQRCheckIn} disabled={isPending || !qrCode.trim()}>
                    <QrCode className="h-4 w-4 mr-2" />
                    {t('qr.button')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('qr.scanInstruction')}
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
                          {t('qr.member')} {lastCheckIn.studentName}
                        </p>
                      )}
                      {lastCheckIn.success && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {t('qr.checkedInAt')} {formatDate(new Date())}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('qr.gymQRTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('qr.gymQRDescription')}
              </p>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm font-mono">gym-checkin-{studioId}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('qr.gymQRComingSoon')}
                </p>
              </div>
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
