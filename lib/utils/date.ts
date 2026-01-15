/**
 * Date formatting utilities for the MyPass platform
 */

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

/**
 * Format datetime for display (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${formatDate(d)} at ${formatTime(d)}`
}

/**
 * Format relative time (e.g., "in 2 hours", "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`
  }
  return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`
}

/**
 * Get day name (e.g., "Monday")
 */
export function getDayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d)
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < new Date().getTime()
}
