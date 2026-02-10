import { z } from 'zod'

const currencySchema = z.string().min(3).max(3).default('MNT')

const difficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const createVideoClassSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().finite().min(0, 'Price must be 0 or more'),
  currency: currencySchema,
  access_duration_days: z.number().int().positive().default(30),
  instructor_id: z.string().uuid().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  difficulty_level: difficultyLevelSchema.optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  is_featured: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateVideoClassSchema = createVideoClassSchema.partial().extend({
  id: z.number().int().positive(),
  is_active: z.boolean().optional(),
})

export const deleteVideoClassSchema = z.object({
  id: z.number().int().positive(),
})

export const createVideoUploadSchema = z.object({
  video_class_id: z.number().int().positive(),
  /** Browser origin for Mux CORS (e.g. https://app.example.com). Must match the page origin or upload will fail. */
  cors_origin: z.string().url().optional(),
})

export const createPreviewUploadSchema = z.object({
  video_class_id: z.number().int().positive(),
  /** Browser origin for Mux CORS. */
  cors_origin: z.string().url().optional(),
})

export type CreateVideoClassInput = z.infer<typeof createVideoClassSchema>
export type UpdateVideoClassInput = z.infer<typeof updateVideoClassSchema>
export type DeleteVideoClassInput = z.infer<typeof deleteVideoClassSchema>
export type CreateVideoUploadInput = z.infer<typeof createVideoUploadSchema>
export type CreatePreviewUploadInput = z.infer<typeof createPreviewUploadSchema>
