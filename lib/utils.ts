import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utility functions
export { formatDateTime, formatDate, formatTime, isToday, getDayName } from './utils/date'
export { formatAmount } from './utils/payments'
