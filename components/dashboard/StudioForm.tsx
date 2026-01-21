'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateStudio } from '@/lib/actions/studios'
import { uploadStudioImage, validateImageFileForUpload } from '@/lib/utils/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { X, Upload, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import { reverseGeocode } from '@/lib/utils/reverse-geocoding'
import type { Tables } from '@/lib/types/database'

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/ui/map-picker').then((mod) => ({ default: mod.MapPicker })), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-lg border overflow-hidden bg-muted" style={{ height: '300px' }}>
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

type Studio = Tables<'studios'>

interface StudioFormProps {
  studio?: Studio | null
}

export function StudioForm({ studio }: StudioFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Image states
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(studio?.logo_url || null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(studio?.cover_image_url || null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  
  // Location states - initialize from studio if available
  const [latitude, setLatitude] = useState<number | null>(
    studio?.latitude != null ? Number(studio.latitude) : null
  )
  const [longitude, setLongitude] = useState<number | null>(
    studio?.longitude != null ? Number(studio.longitude) : null
  )
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const isEditMode = !!studio

  // Initialize coordinates from studio prop when it changes
  useEffect(() => {
    if (studio?.latitude != null && studio?.longitude != null) {
      const lat = Number(studio.latitude)
      const lng = Number(studio.longitude)
      // Only update if values are different to avoid unnecessary re-renders
      setLatitude((prev) => (prev !== lat ? lat : prev))
      setLongitude((prev) => (prev !== lng ? lng : prev))
    }
  }, [studio?.latitude, studio?.longitude])

  // Geocode address when it changes (for initial load or manual entry) - only if no coordinates exist
  useEffect(() => {
    if (isEditMode && studio?.address && !latitude && !longitude) {
      setIsGeocoding(true)
      import('@/lib/utils/geocoding')
        .then(({ geocodeAddress }) => geocodeAddress(studio.address!))
        .then((coords) => {
          if (coords) {
            setLatitude(coords.latitude)
            setLongitude(coords.longitude)
          }
        })
        .catch(() => {
          // Silently fail
        })
        .finally(() => {
          setIsGeocoding(false)
        })
    }
  }, [isEditMode, studio?.address, latitude, longitude])

  // Handle logo file selection
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFileForUpload(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle cover file selection
  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFileForUpload(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setCoverFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Remove logo
  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(null)
  }

  // Remove cover
  function handleRemoveCover() {
    setCoverFile(null)
    setCoverPreview(null)
  }

  // Handle location selection from map
  async function handleLocationSelect(lat: number, lng: number) {
    setLatitude(lat)
    setLongitude(lng)
    toast.success(`Location set: ${lat.toFixed(6)}, ${lng.toFixed(6)}. Click "Update Studio" to save.`)
    
    // Optionally reverse geocode to suggest address (but don't force it)
    setIsReverseGeocoding(true)
    try {
      const address = await reverseGeocode(lat, lng)
      if (address) {
        // Suggest the address but don't overwrite if user has already entered one
        const addressInput = document.getElementById('address') as HTMLInputElement
        if (addressInput && !addressInput.value.trim()) {
          addressInput.value = address
          toast.info('Address suggested from map location. Please verify and edit if needed.')
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
    } finally {
      setIsReverseGeocoding(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (isEditMode && !studio) {
      setError('Studio not found')
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const address = formData.get('address') as string
        const phone = formData.get('phone') as string
        const email = formData.get('email') as string

        let logoUrl = studio?.logo_url || null
        let coverImageUrl = studio?.cover_image_url || null

        // Upload logo if new file selected
        if (logoFile && studio) {
          setUploadingLogo(true)
          const uploadResult = await uploadStudioImage(logoFile, studio.id, 'logo')
          if (!uploadResult.success) {
            toast.error(uploadResult.error || 'Failed to upload logo')
            setUploadingLogo(false)
            return
          }
          logoUrl = uploadResult.url
          setUploadingLogo(false)
        }

        // Upload cover if new file selected
        if (coverFile && studio) {
          setUploadingCover(true)
          const uploadResult = await uploadStudioImage(coverFile, studio.id, 'cover')
          if (!uploadResult.success) {
            toast.error(uploadResult.error || 'Failed to upload cover image')
            setUploadingCover(false)
            return
          }
          coverImageUrl = uploadResult.url
          setUploadingCover(false)
        }

        if (isEditMode) {
          // Update existing studio
          const result = await updateStudio({
            name: name || undefined,
            description: description || null,
            address: address || null,
            phone: phone || null,
            email: email || null,
            logo_url: logoUrl,
            cover_image_url: coverImageUrl,
            latitude: latitude != null ? latitude : null,
            longitude: longitude != null ? longitude : null,
          })

          if (!result.success) {
            setError(result.error)
            toast.error(result.error)
            return
          }

          toast.success('Studio updated successfully')
          router.refresh()
        } else {
          // Create new studio
          const slug = formData.get('slug') as string
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            router.push('/auth/signin')
            return
          }

          const { data: newStudio, error: studioError } = await supabase
            .from('studios')
            .insert({
              owner_id: user.id,
              name,
              slug: slug.toLowerCase().replace(/\s+/g, '-'),
              description: description || null,
              address: address || null,
              phone: phone || null,
              email: email || null,
              logo_url: logoUrl,
              cover_image_url: coverImageUrl,
              latitude: latitude != null ? latitude : null,
              longitude: longitude != null ? longitude : null,
            })
            .select()
            .single()

          if (studioError) {
            if (studioError.code === '23505') {
              setError('This slug is already taken. Please choose another.')
              toast.error('This slug is already taken. Please choose another.')
            } else {
              setError(studioError.message)
              toast.error(studioError.message)
            }
            return
          }

          toast.success('Studio created successfully')
          router.push('/studio')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save studio'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Studio Information' : 'Studio Information'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Studio Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative h-20 w-20 rounded-lg border overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-lg border border-dashed flex items-center justify-center bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoChange}
                  disabled={!isEditMode || uploadingLogo}
                  className="cursor-pointer"
                />
                <p className="text-muted-foreground text-xs mt-1">
                  JPEG, PNG, or WebP. Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Photo</Label>
            <div className="space-y-2">
              {coverPreview ? (
                <div className="relative h-48 w-full rounded-lg border overflow-hidden">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-48 w-full rounded-lg border border-dashed flex items-center justify-center bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCoverChange}
                disabled={!isEditMode || uploadingCover}
                className="cursor-pointer"
              />
              <p className="text-muted-foreground text-xs">
                JPEG, PNG, or WebP. Max 5MB. Recommended: 1200x400px
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Studio Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="My Fitness Studio"
              defaultValue={studio?.name}
            />
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                name="slug"
                required
                placeholder="my-fitness-studio"
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens allowed"
              />
              <p className="text-muted-foreground text-xs">
                This will be your studio URL: /studio/your-slug
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell students about your studio..."
              rows={4}
              defaultValue={studio?.description || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address *
              </div>
            </Label>
            <Input
              id="address"
              name="address"
              required
              placeholder="123 Main St, Ulaanbaatar, Mongolia"
              defaultValue={studio?.address || ''}
            />
            <p className="text-muted-foreground text-xs">
              Enter the official address of your studio. This will be displayed on your public studio page.
            </p>
          </div>

          {/* Interactive Map Picker - Optional visual location selector */}
          {isEditMode && (
            <div className="space-y-2">
              <Label>Pin Location on Map (Optional)</Label>
              <p className="text-muted-foreground text-xs">
                Click on the map to visually set your studio location. This will help students find you more easily.
              </p>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                address={studio?.address || undefined}
                onLocationSelect={handleLocationSelect}
                height="300px"
              />
              {isReverseGeocoding && (
                <p className="text-xs text-muted-foreground">Getting address from location...</p>
              )}
              {(latitude && longitude) && (
                <p className="text-xs text-muted-foreground">
                  Map location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+976 12345678"
                defaultValue={studio?.phone || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="studio@example.com"
                defaultValue={studio?.email || ''}
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || uploadingLogo || uploadingCover}>
              {isPending || uploadingLogo || uploadingCover
                ? 'Saving...'
                : isEditMode
                  ? 'Update Studio'
                  : 'Create Studio'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
