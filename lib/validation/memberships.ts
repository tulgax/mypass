import { z } from 'zod'

// Membership Plan Schemas
const baseMembershipPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  duration_months: z.number().int().positive('Duration must be at least 1 month').max(120), // Max 10 years
  price: z.number().positive('Price must be positive').finite(),
  currency: z.string().min(3).max(3).default('MNT'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  is_active: z.boolean().default(true),
})

export const createMembershipPlanSchema = baseMembershipPlanSchema

export const updateMembershipPlanSchema = baseMembershipPlanSchema.partial().extend({
  id: z.number().int().positive(),
})

export const membershipPlanIdSchema = z.object({
  id: z.number().int().positive(),
})

// Membership Purchase Schema
export const purchaseMembershipSchema = z.object({
  membership_plan_id: z.number().int().positive(),
  studio_id: z.number().int().positive(),
})

// Membership Check-in Schema
export const checkInMembershipSchema = z.object({
  membership_id: z.number().int().positive(),
  check_in_method: z.enum(['student_qr', 'gym_qr']),
  checked_by: z.string().optional().nullable(),
})

// Get Membership by QR Schema
export const getMembershipByQRSchema = z.object({
  qr_code: z.string().min(1, 'QR code is required'),
  studio_id: z.number().int().positive(),
})

// Get Membership by ID for Check-in Schema
export const getMembershipByIdForCheckInSchema = z.object({
  membership_id: z.number().int().positive('Membership ID is required'),
  studio_id: z.number().int().positive(),
})

// Expire Membership Schema
export const expireMembershipSchema = z.object({
  id: z.number().int().positive(),
})

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>
export type UpdateMembershipPlanInput = z.infer<typeof updateMembershipPlanSchema>
export type PurchaseMembershipInput = z.infer<typeof purchaseMembershipSchema>
export type CheckInMembershipInput = z.infer<typeof checkInMembershipSchema>
export type GetMembershipByQRInput = z.infer<typeof getMembershipByQRSchema>
export type GetMembershipByIdForCheckInInput = z.infer<typeof getMembershipByIdForCheckInSchema>
export type ExpireMembershipInput = z.infer<typeof expireMembershipSchema>
