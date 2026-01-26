'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
      toast.error('Please enter a QR code')
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
        message: 'Check-in successful',
        studentName: membershipResult.data.student_name || undefined,
      })
      toast.success(`Check-in successful for ${membershipResult.data.student_name || 'member'}`)
      setQrCode('')
      router.refresh()
    })
  }

  const handleManualCheckIn = async () => {
    // TODO: Implement manual check-in by searching for student
    toast.info('Manual check-in feature coming soon')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Check In</h1>
        <p className="text-sm text-muted-foreground">Scan QR codes or manually check in members</p>
      </div>

      <Tabs defaultValue="qr" className="space-y-6">
        <TabsList>
          <TabsTrigger value="qr">QR Code Scanner</TabsTrigger>
          <TabsTrigger value="manual">Manual Check-In</TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">QR Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-code"
                    placeholder="Enter or scan QR code"
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
                    Check In
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan the QR code from the member's phone or enter it manually
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
                          Member: {lastCheckIn.studentName}
                        </p>
                      )}
                      {lastCheckIn.success && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Checked in at {formatDate(new Date())}
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
              <CardTitle>Gym QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Display this QR code at your gym entrance. Members can scan it to check in.
              </p>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm font-mono">gym-checkin-{studioId}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  QR code display coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Member</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={handleManualCheckIn} disabled={isPending || !searchQuery.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Manual check-in feature coming soon. For now, use QR code scanning.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
