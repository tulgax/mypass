import QRCode from 'qrcode'

/**
 * Generate a unique QR code string for a booking
 * Format: booking-{booking_id}-{timestamp}
 */
export function generateQRCodeString(bookingId: number): string {
  const timestamp = Date.now()
  return `booking-${bookingId}-${timestamp}`
}

/**
 * Generate QR code data URL (base64 image) for display
 */
export async function generateQRCodeDataURL(
  bookingId: number,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  const qrString = generateQRCodeString(bookingId)
  return QRCode.toDataURL(qrString, {
    width: 300,
    errorCorrectionLevel: 'M',
    ...options,
  })
}

/**
 * Parse QR code string to extract booking ID
 */
export function parseQRCodeString(qrString: string): number | null {
  const match = qrString.match(/^booking-(\d+)-/)
  if (!match) return null
  return parseInt(match[1], 10)
}
