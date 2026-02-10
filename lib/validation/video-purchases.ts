import { z } from 'zod'

export const createVideoPurchaseSchema = z.object({
  video_class_id: z.number().int().positive(),
})

export const activateVideoPurchaseSchema = z.object({
  purchase_id: z.number().int().positive(),
})

export type CreateVideoPurchaseInput = z.infer<typeof createVideoPurchaseSchema>
export type ActivateVideoPurchaseInput = z.infer<typeof activateVideoPurchaseSchema>

