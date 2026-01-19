import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function ClassesLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table Card Skeleton */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-10 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="h-10 px-4 text-center align-middle">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
                <th className="h-10 px-4 text-center align-middle">
                  <Skeleton className="h-4 w-20 mx-auto" />
                </th>
                <th className="h-10 px-4 text-right align-middle">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </td>
                  <td className="p-4 align-middle text-center">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
