'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ClassForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classType, setClassType] = useState<'online' | 'offline' | ''>('')
  const [currency, setCurrency] = useState<string>('MNT')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!classType) {
        setError('Please select a class type')
        setLoading(false)
        return
      }

      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
      const capacity = parseInt(formData.get('capacity') as string, 10)
      const type = classType as 'online' | 'offline'
      const zoom_link = formData.get('zoom_link') as string
      const price = parseFloat(formData.get('price') as string)
      const is_active = formData.get('is_active') === 'on'

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Get studio_id
      const { data: studio, error: studioError } = await supabase
        .from('studios')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (studioError || !studio) {
        setError('Studio not found. Please create a studio first.')
        return
      }

      // Create class
      const { data: newClass, error: classError } = await supabase
        .from('classes')
        .insert({
          studio_id: studio.id,
          name,
          description: description || null,
          duration_minutes,
          capacity,
          type,
          zoom_link: type === 'online' ? (zoom_link || null) : null,
          price,
          currency,
          is_active,
        })
        .select()
        .single()

      if (classError) {
        throw classError
      }

      router.push('/studio/catalog/classes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Class</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Yoga Flow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your class..."
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                required
                min="1"
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                required
                min="1"
                placeholder="20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Class Type *</Label>
            <Select
              value={classType}
              onValueChange={(value) => setClassType(value as 'online' | 'offline')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select class type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {classType === 'online' && (
            <div className="space-y-2">
              <Label htmlFor="zoom_link">Zoom Link</Label>
              <Input
                id="zoom_link"
                name="zoom_link"
                type="url"
                placeholder="https://zoom.us/j/..."
              />
              <p className="text-muted-foreground text-xs">
                Optional: Provide the Zoom meeting link for online classes
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MNT">MNT (Mongolian Tugrik)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active (class is available for booking)
            </Label>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
