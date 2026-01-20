import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function PublicStudioLoading() {
  return (
    <div className="min-h-screen">
      {/* Cover Image Skeleton */}
      <div className="relative h-64 md:h-96 w-full">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Studio Header Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo Skeleton */}
          <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-lg" />
          
          {/* Studio Info Skeleton */}
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-8 flex gap-4 border-b">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Content Skeleton */}
        <div className="mt-8">
          {/* Schedule Week Skeleton */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-10" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i} className="flex-1">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
            <Skeleton className="h-10 w-10" />
          </div>

          {/* Sessions List Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
