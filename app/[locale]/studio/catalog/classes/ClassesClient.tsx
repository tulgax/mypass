'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils'
import { MoreHorizontal, X, Eye, Pencil, Trash2, MapPin, Users } from 'lucide-react'
import { deleteClass, createClass, updateClass } from '@/lib/actions/classes'
import { createClassSchema, updateClassSchema } from '@/lib/validation/classes'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
  const t = useTranslations('studio.classes')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  const handleSuccess = () => {
    setOpen(false)
    setEditOpen(false)
    setIsRefreshing(true)
    router.refresh()
    // Reset refreshing state after data should be loaded (1-2 seconds)
    setTimeout(() => setIsRefreshing(false), 2000)
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

  const handleDeleteClick = (classId: number) => {
    const classData = classes.find((c) => c.id === classId)
    if (classData) {
      setSelectedClass(classData)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!selectedClass || isPending) return

    const classIdToDelete = selectedClass.id

    startTransition(async () => {
      const result = await deleteClass({ id: classIdToDelete })

      if (!result.success) {
        // Keep dialog open on error
        toast.error(result.error)
        return
      }

      // Show success toast
      toast.success(t('toast.deleted'))
      
      // Set refreshing state to show skeleton
      setIsRefreshing(true)
      
      // Refresh data - this will cause the component to re-render with updated classes
      router.refresh()
      
      // Wait for the refresh to complete and UI to update, then close dialog
      // We wait a bit longer to ensure the item is removed from the table
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setDeleteDialogOpen(false)
      setSelectedClass(null)
      
      // Reset refreshing state after data should be loaded (1-2 seconds)
      setTimeout(() => setIsRefreshing(false), 2000)
    })
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button onClick={() => setOpen(true)}>{t('createClass')}</Button>
        </div>

        {(isPending || isRefreshing) ? (
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : classes && classes.length > 0 ? (
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
                    <td className="p-4 align-middle text-center text-sm">{cls.duration_minutes} {t('table.minutes')}</td>
                    <td className="p-4 align-middle text-center">
                        <Badge
                          variant={cls.is_active ? 'default' : 'secondary'}
                          className={cls.is_active ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {cls.is_active ? t('status.active') : t('status.inactive')}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{t('actions.moreOptions')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleView(cls.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('actions.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(cls.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(cls.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('actions.delete')}
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
            <CardContent className="p-0">
              <StudioEmptyState
                variant="classes"
                title={t('empty.noClasses')}
                action={<Button onClick={() => setOpen(true)}>{t('empty.createFirst')}</Button>}
                embedded
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
          <div className="p-6 border-b">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>{t('sheet.addClass')}</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">{tCommon('close')}</span>
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
                    <SheetTitle>{t('sheet.viewClass')}</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                        <span className="sr-only">{tCommon('close')}</span>
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
                    <SheetTitle>{t('sheet.editClass')}</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                        <span className="sr-only">{tCommon('close')}</span>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          // Prevent closing while deleting
          if (!isPending) {
            setDeleteDialogOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{tCommon('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? t('dialog.deleting') : tCommon('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ClassViewSheetContent({ classData }: { classData: Class }) {
  const t = useTranslations('studio.classes')
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">{t('form.classType')}</label>
          <div className="flex items-center gap-2 p-4 border-2 rounded-lg">
            <div className={`h-2 w-2 rounded-full ${classData.type === 'online' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="font-medium text-sm capitalize">{classData.type}</span>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('view.name')}</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">{classData.name}</div>
          </div>

          {classData.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('view.description')}</label>
              <div className="p-3 rounded-md border bg-muted/50 text-sm whitespace-pre-wrap">
                {classData.description}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('view.price')}</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              {formatAmount(classData.price, classData.currency)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('view.capacity')}</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              {classData.capacity} {classData.capacity === 1 ? t('view.person') : t('view.people')}
            </div>
          </div>

          {classData.type === 'online' && classData.zoom_link && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('form.zoomLink')}</label>
              <div className="p-3 rounded-md border bg-muted/50 text-sm break-all">
                <a href={classData.zoom_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {classData.zoom_link}
                </a>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('form.durationMinutes')}</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              {classData.duration_minutes} {classData.duration_minutes === 1 ? t('view.minute') : t('view.minutes')}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('view.status')}</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              <span className={`inline-flex items-center gap-2`}>
                <span className={`h-2 w-2 rounded-full ${classData.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                {classData.is_active ? t('status.active') : t('status.inactive')}
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
  const t = useTranslations('studio.classes')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [classType, setClassType] = useState<'online' | 'offline'>(
    (classData?.type as 'online' | 'offline') || 'offline'
  )
  const [currency, setCurrency] = useState<string>(classData?.currency || 'MNT')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const duration_minutes_str = formData.get('duration_minutes') as string
    const capacity_str = formData.get('capacity') as string
    const price_str = formData.get('price') as string
    const type = classType as 'online' | 'offline'
    const zoom_link = formData.get('zoom_link') as string
    const is_active = formData.get('is_active') === 'on'

    // Parse values
    const duration_minutes = parseInt(duration_minutes_str, 10)
    const capacity = parseInt(capacity_str, 10)
    const price = parseFloat(price_str)

    // Prepare input for validation
    const input = {
      name,
      description: description || null,
      type,
      price,
      currency,
      capacity,
      duration_minutes,
      zoom_link: type === 'online' ? (zoom_link || null) : null,
      is_active,
    }

    // Validate first
    let validationResult
    if (isEdit && classData) {
      const updateInput = { ...input, id: classData.id }
      validationResult = updateClassSchema.safeParse(updateInput)
      
      if (!validationResult.success) {
        const zodErrors = validationResult.error.flatten().fieldErrors
        const errors: Record<string, string> = {}
        Object.keys(zodErrors).forEach((key) => {
          const errorMessages = zodErrors[key as keyof typeof zodErrors]
          if (errorMessages && errorMessages.length > 0) {
            errors[key] = errorMessages[0]
          }
        })
        setFieldErrors(errors)
        return
      }
    } else {
      validationResult = createClassSchema.safeParse(input)
      
      if (!validationResult.success) {
        const zodErrors = validationResult.error.flatten().fieldErrors
        const errors: Record<string, string> = {}
        Object.keys(zodErrors).forEach((key) => {
          const errorMessages = zodErrors[key as keyof typeof zodErrors]
          if (errorMessages && errorMessages.length > 0) {
            errors[key] = errorMessages[0]
          }
        })
        setFieldErrors(errors)
        return
      }
    }

    // Execute server action
    startTransition(async () => {
      try {
        let result
        if (isEdit && classData) {
          result = await updateClass(validationResult.data)
        } else {
          result = await createClass(validationResult.data)
        }

        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }

        toast.success(isEdit ? t('toast.updated') : t('toast.created'))
        onSuccess()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save class'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">{t('form.classType')}</label>
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
                <div className="font-medium text-sm">{t('form.online')}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('form.onlineDescription')}
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
                <div className="font-medium text-sm">{t('form.offline')}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('form.offlineDescription')}
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={classData?.name || ''}
              placeholder={t('form.namePlaceholder')}
              className={fieldErrors.name ? 'border-destructive' : ''}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={classData?.description || ''}
              placeholder={t('form.descriptionPlaceholder')}
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
              <Label htmlFor="price">{t('form.price')}</Label>
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
              <Label htmlFor="currency">{t('form.currency')}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MNT">{t('form.currencyMNT')}</SelectItem>
                  <SelectItem value="USD" disabled>{t('form.currencyUSD')}</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="currency" value={currency} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location')}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                id="location"
                name="location"
                placeholder={t('form.locationPlaceholder')}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">{t('form.capacity')}</Label>
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
              <Label htmlFor="zoom_link">{t('form.zoomLink')}</Label>
              <Input
                id="zoom_link"
                name="zoom_link"
                type="url"
                defaultValue={classData?.zoom_link || ''}
                placeholder={t('form.zoomLinkPlaceholder')}
                className={fieldErrors.zoom_link ? 'border-destructive' : ''}
              />
              {fieldErrors.zoom_link && (
                <p className="text-sm text-destructive">{fieldErrors.zoom_link}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">{t('form.durationMinutes')}</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min="1"
              defaultValue={classData?.duration_minutes || ''}
              placeholder={t('form.durationPlaceholder')}
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
              {t('form.isActive')}
            </Label>
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isPending}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (isEdit ? t('form.updating') : t('form.creating')) : (isEdit ? t('form.updateClassButton') : t('form.addClassButton'))}
        </Button>
      </div>
    </form>
  )
}
