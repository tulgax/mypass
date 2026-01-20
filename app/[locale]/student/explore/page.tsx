import { Suspense } from 'react'
import { StudioCard } from '@/components/student/StudioCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { getStudiosForStudent } from '@/lib/data/student-studios'
import type { StudioForStudent } from '@/lib/types/student'
import ExploreLoading from './loading'

async function StudiosList({ search }: { search?: string }) {
  const studios = await getStudiosForStudent(search)

  return (
    <>
      {studios.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio: StudioForStudent) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 sm:p-6 py-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              {search
                ? 'No studios found matching your search.'
                : 'No studios available at this time.'}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Explore Studios</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Browse and book classes from available studios</p>
      </div>

      <form method="get" className="flex flex-col sm:flex-row gap-2 max-w-md">
        <Input
          name="search"
          placeholder="Search studios..."
          defaultValue={search}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-initial min-h-[44px]">Search</Button>
          {search && (
            <Button type="button" variant="outline" className="min-h-[44px]" asChild>
              <Link href="/student/explore">Clear</Link>
            </Button>
          )}
        </div>
      </form>

      <Suspense fallback={<ExploreLoading />}>
        <StudiosList search={search} />
      </Suspense>
    </div>
  )
}
