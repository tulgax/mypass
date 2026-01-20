import type { Tables } from './database'

type Booking = Tables<'bookings'>
type ClassInstance = Tables<'class_instances'>
type Class = Tables<'classes'>
type Studio = Tables<'studios'>

/**
 * Booking with full relations for student view
 */
export type StudentBookingWithRelations = Booking & {
  class_instances: (ClassInstance & {
    classes: Class | null
  }) | null
}

/**
 * Studio with processed class and instance counts for student browsing
 */
export type StudioForStudent = Studio & {
  classes_count: number
  upcoming_instances_count: number
}

/**
 * Booking counts for student overview
 */
export type StudentBookingCounts = {
  upcoming: number
  past: number
}
