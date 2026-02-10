import { z } from 'zod'

export const inviteTeamMemberSchema = z.object({
  studio_id: z.number().int().positive(),
  email: z.string().email('Invalid email'),
  role: z.enum(['manager', 'instructor']),
})

export const updateTeamMemberRoleSchema = z.object({
  studio_id: z.number().int().positive(),
  user_id: z.string().uuid(),
  role: z.enum(['manager', 'instructor']),
})

export const removeTeamMemberSchema = z.object({
  studio_id: z.number().int().positive(),
  user_id: z.string().uuid(),
})

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>
export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>
