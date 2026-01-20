import type { Tables } from './database'
import type { ClassInstanceWithClass as BaseClassInstanceWithClass } from '@/lib/data/class-instances'

type Studio = Tables<'studios'>
type Class = Tables<'classes'>
type ClassInstance = Tables<'class_instances'>

/**
 * Class instance with full class details for public pages
 * Uses the same type as from class-instances DAL but ensures class is not null
 */
export type ClassInstanceWithClass = ClassInstance & {
  classes: Class
}

/**
 * Studio with upcoming class instances for public booking pages
 */
export type PublicStudioWithInstances = Studio & {
  classInstances: ClassInstanceWithClass[]
  latitude?: number | null
  longitude?: number | null
}
