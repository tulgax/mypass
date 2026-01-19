'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatAmount } from '@/lib/utils'
import { MoreHorizontal, X, Eye, Pencil, Trash2, MapPin, Users } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Class {
  id: number
  name: string
  type: string
  duration_minutes: number
  price: number
  currency: string
  capacity: number
  is_active: boolean
  description?: string | null
  zoom_link?: string | null
}

interface ClassesClientProps {
  classes: Class[]
}

export function ClassesClient({ classes }: ClassesClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  const handleSuccess = () => {
    setOpen(false)
    setEditOpen(false)
    router.refresh()
  }

  const handleView = (classId: number) => {
    const classData = classes.find((c) => c.id === classId)
    if (classData) {
      setSelectedClass(classData)
      setViewOpen(true)
    }
  }

  const handleEdit = (classId: number) => {
    const classData = classes.find((c) => c.id === classId)
    if (classData) {
      setSelectedClass(classData)
      setEditOpen(true)
    }
  }

  const handleDelete = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (error) {
        throw error
      }

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete class')
    }
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleView(cls.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(cls.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(cls.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                <SheetTitle>Add class</SheetTitle>
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

      {selectedClass && (
        <>
          <Sheet open={viewOpen} onOpenChange={setViewOpen}>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
              <div className="p-6 border-b">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle>View Class</SheetTitle>
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
                <ClassViewSheetContent classData={selectedClass} />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
              <div className="p-6 border-b">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle>Edit class</SheetTitle>
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
                <ClassFormSheetContent
                  classData={selectedClass}
                  onSuccess={handleSuccess}
                  onCancel={() => setEditOpen(false)}
                  isEdit
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </>
  )
}

function ClassViewSheetContent({ classData }: { classData: Class }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">Class type</label>
          <div className="flex items-center gap-2 p-4 border-2 rounded-lg">
            <div className={`h-2 w-2 rounded-full ${classData.type === 'online' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="font-medium text-sm capitalize">{classData.type}</span>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">{classData.name}</div>
          </div>

          {classData.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <div className="p-3 rounded-md border bg-muted/50 text-sm whitespace-pre-wrap">
                {classData.description}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              {formatAmount(classData.price, classData.currency)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Capacity</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              {classData.capacity} {classData.capacity === 1 ? 'person' : 'people'}
            </div>
          </div>

          {classData.type === 'online' && classData.zoom_link && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom Link</label>
              <div className="p-3 rounded-md border bg-muted/50 text-sm break-all">
                <a href={classData.zoom_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {classData.zoom_link}
                </a>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              {classData.duration_minutes} {classData.duration_minutes === 1 ? 'minute' : 'minutes'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              <span className={`inline-flex items-center gap-2`}>
                <span className={`h-2 w-2 rounded-full ${classData.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                {classData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClassFormSheetContent({
  onSuccess,
  onCancel,
  classData,
  isEdit = false
}: {
  onSuccess: () => void
  onCancel: () => void
  classData?: Class | null
  isEdit?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [classType, setClassType] = useState<'online' | 'offline'>(
    (classData?.type as 'online' | 'offline') || 'offline'
  )
  const [currency, setCurrency] = useState<string>(classData?.currency || 'MNT')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const duration_minutes_str = formData.get('duration_minutes') as string
      const capacity_str = formData.get('capacity') as string
      const price_str = formData.get('price') as string
      const type = classType as 'online' | 'offline'
      const zoom_link = formData.get('zoom_link') as string
      const is_active = formData.get('is_active') === 'on'

      // Validation
      const errors: Record<string, string> = {}

      if (!name || name.trim() === '') {
        errors.name = 'Name is required'
      }

      if (!price_str || price_str.trim() === '' || isNaN(parseFloat(price_str))) {
        errors.price = 'Price is required and must be a valid number'
      }

      if (!capacity_str || capacity_str.trim() === '' || isNaN(parseInt(capacity_str, 10)) || parseInt(capacity_str, 10) < 1) {
        errors.capacity = 'Capacity is required and must be at least 1'
      }

      if (!duration_minutes_str || duration_minutes_str.trim() === '' || isNaN(parseInt(duration_minutes_str, 10)) || parseInt(duration_minutes_str, 10) < 1) {
        errors.duration_minutes = 'Duration is required and must be at least 1 minute'
      }

      if (type === 'online' && (!zoom_link || zoom_link.trim() === '')) {
        errors.zoom_link = 'Zoom link is required for online classes'
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setLoading(false)
        return
      }

      const duration_minutes = parseInt(duration_minutes_str, 10)
      const capacity = parseInt(capacity_str, 10)
      const price = parseFloat(price_str)

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

      if (isEdit && classData) {
        // Update class
        const { error: classError } = await supabase
          .from('classes')
          .update({
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
          .eq('id', classData.id)

        if (classError) {
          throw classError
        }
      } else {
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
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">Class type</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${classType === 'online'
              ? 'border-foreground bg-muted/50'
              : 'border-border hover:bg-muted/30'
              }`}>
              <input
                type="radio"
                name="class_type"
                value="online"
                checked={classType === 'online'}
                onChange={() => setClassType('online')}
                className="mt-1 h-4 w-4 accent-black"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">Online</div>
                <div className="text-xs text-muted-foreground mt-1">
                  A virtual class that clients can join remotely.
                </div>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${classType === 'offline'
              ? 'border-foreground bg-muted/50'
              : 'border-border hover:bg-muted/30'
              }`}>
              <input
                type="radio"
                name="class_type"
                value="offline"
                checked={classType === 'offline'}
                onChange={() => setClassType('offline')}
                className="mt-1 h-4 w-4 accent-black"
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={classData?.name || ''}
              placeholder="e.g. Pilates in group"
              className={fieldErrors.name ? 'border-destructive' : ''}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={classData?.description || ''}
              placeholder="What can clients expect from this service?"
              rows={4}
              className={`flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.description ? 'border-destructive' : 'border-input'
                }`}
            />
            {fieldErrors.description && (
              <p className="text-sm text-destructive">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">₮</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={classData?.price || ''}
                  placeholder="0.00"
                  className={`pl-8 ${fieldErrors.price ? 'border-destructive' : ''}`}
                />
              </div>
              {fieldErrors.price && (
                <p className="text-sm text-destructive">{fieldErrors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MNT">MNT (Mongolian Tugrik)</SelectItem>
                  <SelectItem value="USD" disabled>USD (US Dollar)</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="currency" value={currency} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="location"
                name="location"
                placeholder="Enter location"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                defaultValue={classData?.capacity || 5}
                className={`pl-10 ${fieldErrors.capacity ? 'border-destructive' : ''}`}
              />
            </div>
            {fieldErrors.capacity && (
              <p className="text-sm text-destructive">{fieldErrors.capacity}</p>
            )}
          </div>

          {classType === 'online' && (
            <div className="space-y-2">
              <Label htmlFor="zoom_link">Zoom Link</Label>
              <Input
                id="zoom_link"
                name="zoom_link"
                type="url"
                defaultValue={classData?.zoom_link || ''}
                placeholder="https://zoom.us/j/..."
                className={fieldErrors.zoom_link ? 'border-destructive' : ''}
              />
              {fieldErrors.zoom_link && (
                <p className="text-sm text-destructive">{fieldErrors.zoom_link}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min="1"
              defaultValue={classData?.duration_minutes || ''}
              placeholder="60"
              className={fieldErrors.duration_minutes ? 'border-destructive' : ''}
            />
            {fieldErrors.duration_minutes && (
              <p className="text-sm text-destructive">{fieldErrors.duration_minutes}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              defaultChecked={classData?.is_active !== false}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_active" className="cursor-pointer font-normal">
              Active (class is available for booking)
            </Label>
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update class' : 'Add class')}
        </Button>
      </div>
    </form>
  )
}
