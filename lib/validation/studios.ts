import { z } from 'zod'

/**
 * Schema for updating studio information
 * All fields are optional for partial updates
 */
export const updateStudioSchema = z.object({
  name: z.string().min(1, 'Studio name is required').max(100, 'Studio name must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable().optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').nullable().optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').nullable().optional(),
  email: z.string().email('Invalid email address').max(100, 'Email must be less than 100 characters').nullable().optional(),
  logo_url: z.string().url('Invalid logo URL').nullable().optional(),
  cover_image_url: z.string().url('Invalid cover image URL').nullable().optional(),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').nullable().optional(),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').nullable().optional(),
})

export type UpdateStudioInput = z.infer<typeof updateStudioSchema>
