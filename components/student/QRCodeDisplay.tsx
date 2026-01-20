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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Check-in QR Code</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              className="rounded-lg border max-w-[250px] sm:max-w-[300px] w-full h-auto" 
            />
            <p className="text-muted-foreground text-xs sm:text-sm text-center">
              Show this QR code at the studio for check-in
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm sm:text-base">Generating QR code...</p>
        )}
      </CardContent>
    </Card>
  )
}
