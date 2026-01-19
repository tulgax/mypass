import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function TeamSettingsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Empty State Card Skeleton */}
      <Card>
        <CardContent className="py-12 text-center">
          <Skeleton className="h-4 w-40 mx-auto mb-4" />
          <Skeleton className="h-10 w-48 mx-auto" />
        </CardContent>
      </Card>
    </div>
  )
}
