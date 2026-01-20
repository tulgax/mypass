import { z } from 'zod'

// Base schema without refine (allows .partial())
const baseClassSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  type: z.enum(['online', 'offline'], {
    errorMap: () => ({ message: 'Class type must be online or offline' }),
  }),
  price: z.number().positive('Price must be positive').finite(),
  currency: z.string().min(3).max(3).default('MNT'),
  capacity: z.number().int().positive('Capacity must be at least 1').max(1000),
  duration_minutes: z.number().int().positive('Duration must be at least 1 minute').max(1440),
  zoom_link: z.string().url('Invalid URL').optional().nullable(),
  is_active: z.boolean().default(true),
})

// Validation function for zoom_link requirement (handles partial types)
const zoomLinkRefine = (data: { type?: 'online' | 'offline'; zoom_link?: string | null }) => {
  // If type is online, zoom_link must be provided and non-empty
  if (data.type === 'online') {
    return data.zoom_link !== null && data.zoom_link !== undefined && data.zoom_link.trim() !== ''
  }
  return true
}

// Create schema with refine
export const createClassSchema = baseClassSchema.refine(zoomLinkRefine, {
  message: 'Zoom link is required for online classes',
  path: ['zoom_link'],
})

// Update schema: partial base schema + id, with refine
export const updateClassSchema = baseClassSchema.partial().extend({
  id: z.number().int().positive(),
}).refine(zoomLinkRefine, {
  message: 'Zoom link is required for online classes',
  path: ['zoom_link'],
})

export const classIdSchema = z.object({
  id: z.number().int().positive(),
})

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
