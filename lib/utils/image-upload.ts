'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Allowed image file types
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.',
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename for studio image
 */
function generateImageFilename(studioId: number, type: 'logo' | 'cover', originalFilename: string): string {
  const timestamp = Date.now()
  const extension = originalFilename.split('.').pop() || 'jpg'
  return `${studioId}/${type}/${timestamp}.${extension}`
}

/**
 * Validate image file (client-side validation helper)
 * Note: This is a helper function, actual validation happens in uploadStudioImage
 */
export function validateImageFileForUpload(file: File): { valid: boolean; error?: string } {
  return validateImageFile(file)
}

/**
 * Upload studio image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadStudioImage(
  file: File,
  studioId: number,
  type: 'logo' | 'cover'
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { success: false, error: validation.error || 'Invalid file' }
  }

  try {
    const supabase = createClient()
    const filename = generateImageFilename(studioId, type, file.name)
    const bucketName = 'studios' // Adjust bucket name as needed

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
      })

    if (error) {
      return { success: false, error: `Failed to upload image: ${error.message}` }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

/**
 * Delete studio image from Supabase Storage
 */
export async function deleteStudioImage(
  imageUrl: string,
  studioId: number,
  type: 'logo' | 'cover'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const bucketName = 'studios'

    // Extract path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const pathIndex = pathParts.findIndex((part) => part === bucketName)
    if (pathIndex === -1) {
      return { success: false, error: 'Invalid image URL' }
    }

    const filePath = pathParts.slice(pathIndex + 1).join('/')

    const { error } = await supabase.storage.from(bucketName).remove([filePath])

    if (error) {
      return { success: false, error: `Failed to delete image: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    }
  }
}
