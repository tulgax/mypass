import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudioHeader } from '@/components/studio/StudioHeader'
import { ClassCard } from '@/components/studio/ClassCard'

export default async function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch studio
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('*')
    .eq('slug', slug)
    .single()

  if (studioError || !studio) {
    notFound()
  }

  // Fetch active classes with upcoming instances
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      class_instances (
        *,
        bookings (id)
      )
    `)
    .eq('studio_id', studio.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Filter instances to only show upcoming ones
  const classesWithUpcomingInstances = (classes || []).map((cls) => ({
    ...cls,
    class_instances: (cls.class_instances || []).filter(
      (instance: any) =>
        !instance.is_cancelled &&
        new Date(instance.scheduled_at) > new Date() &&
        instance.current_bookings < cls.capacity
    ),
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <StudioHeader studio={studio} />
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">Available Classes</h2>
        {classesWithUpcomingInstances.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No upcoming classes available at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classesWithUpcomingInstances.map((cls) => (
              <ClassCard key={cls.id} classData={cls} studioSlug={slug} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
