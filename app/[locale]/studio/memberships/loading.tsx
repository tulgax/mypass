import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
