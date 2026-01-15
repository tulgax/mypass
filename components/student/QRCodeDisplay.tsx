'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QRCodeDisplayProps {
  qrCode: string
  bookingId: number
}

export function QRCodeDisplay({ qrCode, bookingId }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    async function generateQR() {
      try {
        const QRCode = (await import('qrcode')).default
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Check-in QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img src={qrDataUrl} alt="QR Code" className="rounded-lg border" />
            <p className="text-muted-foreground text-xs text-center">
              Show this QR code at the studio for check-in
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Generating QR code...</p>
        )}
      </CardContent>
    </Card>
  )
}
