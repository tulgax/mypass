/**
 * Payment gateway interface for Mongolian payment providers
 * Supports QPay, Khan Bank, and other local gateways
 */

export type PaymentGateway = 'qpay' | 'khan_bank' | 'other'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface PaymentRequest {
  bookingId: number
  amount: number
  currency: string
  gateway: PaymentGateway
  description?: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  error?: string
}

/**
 * Initialize payment with gateway
 * This is a placeholder structure - actual implementation will depend on gateway API
 */
export async function initiatePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  // TODO: Implement actual gateway integration
  // For QPay: https://doc.qpay.mn/
  // For Khan Bank: Contact bank for API documentation
  
  return {
    success: false,
    error: 'Payment gateway integration pending',
  }
}

/**
 * Verify payment status from gateway webhook
 */
export async function verifyPayment(
  transactionId: string,
  gateway: PaymentGateway
): Promise<{ verified: boolean; status: PaymentStatus }> {
  // TODO: Implement webhook verification
  return {
    verified: false,
    status: 'pending',
  }
}

/**
 * Format amount for display
 * Uses deterministic formatting to avoid hydration mismatches
 */
export function formatAmount(amount: number, currency: string = 'MNT'): string {
  // Format number with thousand separators
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  // Use consistent currency symbols/formatting
  if (currency === 'MNT') {
    return `₮ ${formattedNumber}`
  }
  
  // For other currencies, use standard currency formatting
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  
  const symbol = currencySymbols[currency] || currency
  return `${symbol}${formattedNumber}`
}
