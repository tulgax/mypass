'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import QRCode from 'qrcode'

interface MembershipQRDisplayProps {
  qrCode: string
  membershipId: number
}

export function MembershipQRDisplay({ qrCode, membershipId }: MembershipQRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    async function generateQR() {
      try {
        const dataUrl = await QRCode.toDataURL(qrCode, {
          width: 300,
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }
    generateQR()
  }, [qrCode])

  return (
    <div className="space-y-4">
      {qrDataUrl ? (
        <div className="flex flex-col items-center gap-4">
          <img
            src={qrDataUrl}
            alt="Membership QR Code"
            className="rounded-lg border max-w-[300px] w-full h-auto"
          />
          <p className="text-sm text-muted-foreground text-center">
            Show this QR code at the gym entrance for check-in
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center">Generating QR code...</p>
      )}
    </div>
  )
}
