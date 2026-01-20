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
})

export type CreateClassInstanceInput = z.infer<typeof createClassInstanceSchema>
export type CreateClassInstancesInput = z.infer<typeof createClassInstancesSchema>
export type CreateScheduleWithRepeatInput = z.infer<typeof createScheduleWithRepeatSchema>
