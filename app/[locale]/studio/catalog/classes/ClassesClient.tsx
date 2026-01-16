'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatAmount } from '@/lib/utils'
import { MoreHorizontal, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { ClassForm } from '@/components/dashboard/ClassForm'
import Link from 'next/link'

interface Class {
  id: number
  name: string
  type: string
  duration_minutes: number
  price: number
  currency: string
  capacity: number
  is_active: boolean
}

interface ClassesClientProps {
  classes: Class[]
}

export function ClassesClient({ classes }: ClassesClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Classes</h1>
            <p className="text-sm text-muted-foreground">Manage your studio classes</p>
          </div>
          <Button onClick={() => setOpen(true)}>Create Class</Button>
        </div>

        {classes && classes.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">Name</th>
                    <th className="h-10 px-4 text-center align-middle text-xs font-medium text-muted-foreground">Price</th>
                    <th className="h-10 px-4 text-center align-middle text-xs font-medium text-muted-foreground">Duration</th>
                    <th className="h-10 px-4 text-right align-middle text-xs font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{cls.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 capitalize">{cls.type || 'Class'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center text-sm">{formatAmount(cls.price, cls.currency)}</td>
                      <td className="p-4 align-middle text-center text-sm">{cls.duration_minutes} minutes</td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/studio/catalog/classes/${cls.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No classes yet</p>
              <Button onClick={() => setOpen(true)}>Create your first class</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
          <div className="p-6 border-b">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Add service</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ClassFormSheetContent onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function ClassFormSheetContent({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classType, setClassType] = useState<'online' | 'offline'>('offline')
  const [currency, setCurrency] = useState<string>('MNT')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
      const capacity = parseInt(formData.get('capacity') as string, 10)
      const type = classType as 'online' | 'offline'
      const zoom_link = formData.get('zoom_link') as string
      const price = parseFloat(formData.get('price') as string)
      const is_active = formData.get('is_active') === 'on'

      const { createClient } = await import('@/lib/supabase/client')
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
      const { error: classError } = await supabase
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

      if (classError) {
        throw classError
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">Class type</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              classType === 'online' 
                ? 'border-foreground bg-muted/50' 
                : 'border-border hover:bg-muted/30'
            }`}>
              <input
                type="radio"
                name="class_type"
                value="online"
                checked={classType === 'online'}
                onChange={() => setClassType('online')}
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">Online</div>
                <div className="text-xs text-muted-foreground mt-1">
                  A virtual class that clients can join remotely.
                </div>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              classType === 'offline' 
                ? 'border-foreground bg-muted/50' 
                : 'border-border hover:bg-muted/30'
            }`}>
              <input
                type="radio"
                name="class_type"
                value="offline"
                checked={classType === 'offline'}
                onChange={() => setClassType('offline')}
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">Offline</div>
                <div className="text-xs text-muted-foreground mt-1">
                  An in-person class at your studio location.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. Pilates in group"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="What can clients expect from this service?"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">📍</span>
              <input
                id="location"
                name="location"
                placeholder="Enter location"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="capacity" className="text-sm font-medium">Capacity</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">👤</span>
              <input
                id="capacity"
                name="capacity"
                type="number"
                required
                min="1"
                defaultValue="5"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {classType === 'online' && (
            <div className="space-y-2">
              <label htmlFor="zoom_link" className="text-sm font-medium">Zoom Link</label>
              <input
                id="zoom_link"
                name="zoom_link"
                type="url"
                placeholder="https://zoom.us/j/..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="duration_minutes" className="text-sm font-medium">Duration (minutes)</label>
            <input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              required
              min="1"
              placeholder="60"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Add service'}
        </Button>
      </div>
    </form>
  )
}
