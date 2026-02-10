import { z } from 'zod'

const planItemSchema = z.object({
  class_id: z.number().int().positive('Class is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
})

const basePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  payment_type: z.enum(['membership', 'single']),
  price: z.number().positive('Price must be positive').finite(),
  currency: z.string().min(3).max(3).default('MNT'),
  billing_period_months: z.union([z.literal(1), z.literal(3), z.literal(12)]).optional().nullable(),
  is_active: z.boolean().default(true),
  items: z.array(planItemSchema).min(1, 'At least one class with quantity is required'),
  benefits: z.array(z.string().min(1)).default([]),
})

export const createPlanSchema = basePlanSchema.refine(
  (data) => {
    if (data.payment_type === 'membership') {
      return data.billing_period_months != null
    }
    return true
  },
  { message: 'Billing period is required for membership plans', path: ['billing_period_months'] }
)

export const updatePlanSchema = basePlanSchema.partial().extend({
  id: z.number().int().positive(),
})

export const deletePlanSchema = z.object({
  id: z.number().int().positive(),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type DeletePlanInput = z.infer<typeof deletePlanSchema>
