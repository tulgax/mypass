'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createScheduleWithRepeatSchema, updateClassInstanceSchema, deleteClassInstanceSchema } from '@/lib/validation/class-instances'
import { getStudioBasicInfo } from '@/lib/data/studios'
import { getActiveClassesByStudioId } from '@/lib/data/classes'
import { getClassInstanceById } from '@/lib/data/class-instances'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

/**
 * Create class instances (single or multiple)
 */
export async function createClassInstances(
  classId: number,
  instances: Array<{ scheduled_at: string; ends_at: string }>
): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify the class belongs to the user's studio
    const studio = await getStudioBasicInfo(user.id)
    if (!studio) {
      return { success: false, error: 'Studio not found' }
    }

    const { data: classData, error: verifyError } = await supabase
      .from('classes')
      .select('id, is_active')
      .eq('id', classId)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError || !classData) {
      return { success: false, error: 'Class not found or unauthorized' }
    }

    if (!classData.is_active) {
      return { success: false, error: 'Cannot schedule inactive classes. Please activate the class first.' }
    }

    if (instances.length === 0) {
      return { success: false, error: 'No instances to create' }
    }

    const { error } = await supabase
      .from('class_instances')
      .insert(
        instances.map((instance) => ({
          class_id: classId,
          scheduled_at: instance.scheduled_at,
          ends_at: instance.ends_at,
        }))
      )

    if (error) {
      return { success: false, error: `Failed to create instances: ${error.message}` }
    }

    revalidatePath('/studio/schedule')
    revalidatePath('/studio/overview')

    return { success: true, data: { count: instances.length } }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create class instances' }
  }
}

/**
 * Create schedule with repeat logic
 */
export async function createScheduleWithRepeat(input: unknown): Promise<ActionResult<{ instancesCreated: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createScheduleWithRepeatSchema.parse(input)
    const { class_id, start_date, start_time, repeat, selected_days } = validated

    // Verify the class belongs to the user's studio
    const studio = await getStudioBasicInfo(user.id)
    if (!studio) {
      return { success: false, error: 'Studio not found' }
    }

    const activeClasses = await getActiveClassesByStudioId(studio.id)
    const selectedClass = activeClasses.find((c) => c.id === class_id)

    if (!selectedClass) {
      return { success: false, error: 'Class not found, inactive, or unauthorized' }
    }

    // Build instances
    const instances: Array<{ scheduled_at: string; ends_at: string }> = []
    const [year, month, day] = start_date.split('-').map(Number)
    const [hours, minutes] = start_time.split(':').map(Number)
    const start = new Date(year, month - 1, day, hours, minutes)

    if (repeat === 'none') {
      const endsAt = new Date(start.getTime() + selectedClass.duration_minutes * 60 * 1000)
      instances.push({
        scheduled_at: start.toISOString(),
        ends_at: endsAt.toISOString(),
      })
    } else if (repeat === 'weekly' && selected_days && selected_days.length > 0) {
      const startDay = new Date(start_date)
      for (let offset = 0; offset < 28; offset += 1) {
        const current = new Date(startDay)
        current.setDate(startDay.getDate() + offset)
        if (!selected_days.includes(current.getDay())) continue

        const scheduled = new Date(
          current.getFullYear(),
          current.getMonth(),
          current.getDate(),
          start.getHours(),
          start.getMinutes()
        )
        if (scheduled < start) continue

        const endsAt = new Date(scheduled.getTime() + selectedClass.duration_minutes * 60 * 1000)
        instances.push({
          scheduled_at: scheduled.toISOString(),
          ends_at: endsAt.toISOString(),
        })
      }

      // Create weekly schedule entry
      const endTime = new Date(start.getTime() + selectedClass.duration_minutes * 60 * 1000)
      const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`

      const { error: scheduleError } = await supabase.from('class_schedules').insert(
        selected_days.map((day) => ({
          class_id,
          day_of_week: day,
          start_time,
          end_time: endTimeString,
          is_active: true,
        }))
      )

      if (scheduleError) {
        return { success: false, error: `Failed to create schedule: ${scheduleError.message}` }
      }
    }

    if (instances.length === 0) {
      return { success: false, error: 'No upcoming sessions generated' }
    }

    // Create instances
    const result = await createClassInstances(class_id, instances)
    if (!result.success) {
      return result
    }

    return { success: true, data: { instancesCreated: instances.length } }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create schedule' }
  }
}

/**
 * Update a class instance (scheduled time)
 */
export async function updateClassInstance(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateClassInstanceSchema.parse(input)
    const { id, scheduled_at, ends_at } = validated

    // Verify the instance belongs to the user's studio
    const studio = await getStudioBasicInfo(user.id)
    if (!studio) {
      return { success: false, error: 'Studio not found' }
    }

    // Get instance and verify ownership
    const instance = await getClassInstanceById(id)
    if (!instance) {
      return { success: false, error: 'Class instance not found' }
    }

    if (!instance.classes || instance.classes.studio_id !== studio.id) {
      return { success: false, error: 'Unauthorized: Instance does not belong to your studio' }
    }

    // Check if instance is in the past
    const scheduledAt = new Date(scheduled_at)
    const now = new Date()
    if (scheduledAt <= now) {
      return { success: false, error: 'Cannot update past class instances' }
    }

    // Update the instance
    const { error: updateError } = await supabase
      .from('class_instances')
      .update({
        scheduled_at,
        ends_at,
      })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: `Failed to update instance: ${updateError.message}` }
    }

    revalidatePath('/studio/schedule')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update class instance' }
  }
}

/**
 * Delete or cancel a class instance
 * If instance has bookings: soft delete (set is_cancelled = true)
 * If no bookings: hard delete
 */
export async function deleteClassInstance(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { id } = deleteClassInstanceSchema.parse(input)

    // Verify the instance belongs to the user's studio
    const studio = await getStudioBasicInfo(user.id)
    if (!studio) {
      return { success: false, error: 'Studio not found' }
    }

    // Get instance and verify ownership
    const instance = await getClassInstanceById(id)
    if (!instance) {
      return { success: false, error: 'Class instance not found' }
    }

    if (!instance.classes || instance.classes.studio_id !== studio.id) {
      return { success: false, error: 'Unauthorized: Instance does not belong to your studio' }
    }

    // Check if instance has bookings
    if (instance.current_bookings > 0) {
      // Soft delete: cancel the instance
      const { error: cancelError } = await supabase
        .from('class_instances')
        .update({ is_cancelled: true })
        .eq('id', id)

      if (cancelError) {
        return { success: false, error: `Failed to cancel instance: ${cancelError.message}` }
      }
    } else {
      // Hard delete: remove the instance
      const { error: deleteError } = await supabase
        .from('class_instances')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return { success: false, error: `Failed to delete instance: ${deleteError.message}` }
      }
    }

    revalidatePath('/studio/schedule')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete class instance' }
  }
}
