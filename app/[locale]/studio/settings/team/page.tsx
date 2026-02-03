import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function TeamSettingsPage() {
  const t = await getTranslations('studio.settings.team')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // TODO: Fetch team members from database when team table is created
  const teamMembers: any[] = []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button>{t('inviteMember')}</Button>
      </div>

      {teamMembers && teamMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member: any) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>{member.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <CardDescription>{member.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">{t('manage')}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{t('noMembers')}</p>
            <Button>{t('inviteFirst')}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
