import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-10 w-full sm:w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-10 w-full sm:w-24" />
          </CardContent>
        </Card>
      </div>

      {/* Explore Studios Card Skeleton */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Skeleton className="h-4 w-64 mb-4" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </CardContent>
      </Card>
    </div>
  )
}
