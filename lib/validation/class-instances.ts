import { z } from 'zod'

export const createClassInstanceSchema = z.object({
  class_id: z.number().int().positive(),
  scheduled_at: z.string().datetime(),
  ends_at: z.string().datetime(),
})

export const createClassInstancesSchema = z.object({
  class_id: z.number().int().positive(),
  instances: z.array(createClassInstanceSchema).min(1, 'At least one instance is required'),
})

export const createClassScheduleSchema = z.object({
  class_id: z.number().int().positive(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  is_active: z.boolean().default(true),
})

export const createScheduleWithRepeatSchema = z.object({
  class_id: z.number().int().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  repeat: z.enum(['none', 'weekly']).default('none'),
  selected_days: z.array(z.number().int().min(0).max(6)).optional(),
  instructor_id: z.string().uuid().nullable().optional(),
})

export const updateClassInstanceSchema = z.object({
  id: z.number().int().positive(),
  scheduled_at: z.string().datetime('Invalid date/time format'),
  ends_at: z.string().datetime('Invalid date/time format'),
}).refine(
  (data) => {
    const scheduledAt = new Date(data.scheduled_at)
    const endsAt = new Date(data.ends_at)
    return endsAt > scheduledAt
  },
  {
    message: 'End time must be after start time',
    path: ['ends_at'],
  }
).refine(
  (data) => {
    const scheduledAt = new Date(data.scheduled_at)
    const now = new Date()
    return scheduledAt > now
  },
  {
    message: 'Scheduled time must be in the future',
    path: ['scheduled_at'],
  }
)

export const deleteClassInstanceSchema = z.object({
  id: z.number().int().positive(),
})

export const updateClassInstanceInstructorSchema = z.object({
  id: z.number().int().positive(),
  instructor_id: z.string().uuid().nullable(),
})

export const createManualBookingSchema = z.object({
  class_instance_id: z.number().int().positive(),
  student_id: z.string().uuid(),
  status: z.enum(['confirmed', 'pending']).default('confirmed'),
})

export type CreateClassInstanceInput = z.infer<typeof createClassInstanceSchema>
export type CreateClassInstancesInput = z.infer<typeof createClassInstancesSchema>
export type CreateScheduleWithRepeatInput = z.infer<typeof createScheduleWithRepeatSchema>
export type UpdateClassInstanceInput = z.infer<typeof updateClassInstanceSchema>
export type DeleteClassInstanceInput = z.infer<typeof deleteClassInstanceSchema>
export type UpdateClassInstanceInstructorInput = z.infer<typeof updateClassInstanceInstructorSchema>
export type CreateManualBookingInput = z.infer<typeof createManualBookingSchema>
