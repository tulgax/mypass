import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getInstructorStatsByStudioId } from '@/lib/data/instructors'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'

export default async function InstructorsPage() {
  const t = await getTranslations('studio.instructors')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { studio, role } = await getStudioAndRoleForUser(user.id)
  if (!studio) {
    notFound()
  }
  if (role === 'instructor') {
    notFound()
  }

  const instructors = await getInstructorStatsByStudioId(studio.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {instructors.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y rounded-lg border">
              <div className="grid grid-cols-3 gap-4 bg-muted/50 px-4 py-3 text-sm font-medium">
                <div>{t('instructor')}</div>
                <div className="text-right">{t('classesTaught')}</div>
                <div className="text-right">{t('hoursTaught')}</div>
              </div>
              {instructors.map((inst) => (
                <div
                  key={inst.user_id}
                  className="grid grid-cols-3 gap-4 px-4 py-3 align-middle"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={inst.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {inst.full_name?.[0] ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {inst.full_name ?? '—'}
                    </span>
                  </div>
                  <div className="text-right self-center">{inst.classes_taught_count}</div>
                  <div className="text-right self-center">{inst.hours_taught}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <StudioEmptyState
              variant="clients"
              title={t('empty')}
              embedded
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
