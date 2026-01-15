import { createClient } from '@/lib/supabase/server'
import { StudioCard } from '@/components/student/StudioCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const supabase = await createClient()
  const { search } = await searchParams

  // Fetch all studios with their classes and instances
  let query = supabase
    .from('studios')
    .select(`
      *,
      classes (
        id,
        capacity,
        is_active,
        class_instances (
          id,
          scheduled_at,
          is_cancelled,
          current_bookings
        )
      )
    `)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: studios } = await query

  // Process studios to get counts and upcoming instances
  const now = new Date().toISOString()
  const processedStudios = (studios || []).map((studio: any) => {
    // Filter active classes
    const activeClasses = (studio.classes || []).filter((cls: any) => cls.is_active)
    
    // Count upcoming instances with available spots
    let upcomingCount = 0
    activeClasses.forEach((cls: any) => {
      const instances = cls.class_instances || []
      instances.forEach((instance: any) => {
        if (
          !instance.is_cancelled &&
          instance.scheduled_at > now &&
          instance.current_bookings < cls.capacity
        ) {
          upcomingCount++
        }
      })
    })

    return {
      ...studio,
      classes_count: activeClasses.length,
      upcoming_instances_count: upcomingCount,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Explore Studios</h1>
        <p className="text-muted-foreground">Browse and book classes from available studios</p>
      </div>

      <form method="get" className="flex gap-2 max-w-md">
        <Input
          name="search"
          placeholder="Search studios by name or description..."
          defaultValue={search}
          className="flex-1"
        />
        <Button type="submit">Search</Button>
        {search && (
          <Button type="button" variant="outline" asChild>
            <a href="/student/explore">Clear</a>
          </Button>
        )}
      </form>

      {processedStudios.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processedStudios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {search
                ? 'No studios found matching your search.'
                : 'No studios available at this time.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
