'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StudioForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const slug = formData.get('slug') as string
      const description = formData.get('description') as string
      const address = formData.get('address') as string
      const phone = formData.get('phone') as string
      const email = formData.get('email') as string

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Create studio
      const { data: studio, error: studioError } = await supabase
        .from('studios')
        .insert({
          owner_id: user.id,
          name,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          description: description || null,
          address: address || null,
          phone: phone || null,
          email: email || null,
        })
        .select()
        .single()

      if (studioError) {
        if (studioError.code === '23505') {
          setError('This slug is already taken. Please choose another.')
        } else {
          throw studioError
        }
        return
      }

      router.push('/studio')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create studio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Studio Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Studio Name *</Label>
            <Input id="name" name="name" required placeholder="My Fitness Studio" />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell students about your studio..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Main St, Ulaanbaatar" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+976 12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="studio@example.com" />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Studio'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
