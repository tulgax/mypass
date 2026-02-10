import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Clock, Tag } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import { getActiveVideoClassByStudioSlugAndId } from '@/lib/data/video-classes'
import { signMuxPlaybackToken } from '@/lib/mux/client'
import { VideoWatchPlayer } from './VideoWatchPlayer'
import { BuyVideoButton } from './BuyVideoButton'
import { PreviewPlayer } from './PreviewPlayer'

export const dynamic = 'force-dynamic'

const RESERVED_ROUTES = [
  'studio',
  'auth',
  'student',
  'branding',
  'contact',
  'cookies',
  'privacy',
  'terms',
]

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export default async function WatchVideoPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string; videoId: string }>
}) {
  const { slug, locale, videoId } = await params
  if (RESERVED_ROUTES.includes(slug)) {
    notFound()
  }

  const id = Number(videoId)
  if (!Number.isFinite(id)) notFound()

  const t = await getTranslations({
    locale,
    namespace: 'studioPublic.videoWatch',
  })
  const tDiff = await getTranslations({
    locale,
    namespace: 'studio.videoClasses.difficulty',
  })
  const tCat = await getTranslations({
    locale,
    namespace: 'studio.videoClasses.categories',
  })
  const video = await getActiveVideoClassByStudioSlugAndId(slug, id)
  if (!video) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const playbackId = video.mux_playback_id
  const ready = video.mux_status === 'ready' && !!playbackId

  // Video metadata section (shared across all views)
  const metadataSection = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{video.title}</h1>
        {video.description && (
          <p className="text-muted-foreground">{video.description}</p>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {video.instructor && (
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {video.instructor.full_name}
          </span>
        )}
        {video.duration_seconds && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {video.category && (
          <Badge variant="outline">
            {tCat(video.category, { defaultValue: video.category })}
          </Badge>
        )}
        {video.difficulty_level && (
          <Badge variant="secondary">{tDiff(video.difficulty_level)}</Badge>
        )}
        {video.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            <Tag className="mr-1 h-3 w-3" />
            {tag}
          </Badge>
        ))}
      </div>

      {/* Price info */}
      <div className="text-sm">
        <span className="font-medium">
          {formatAmount(Number(video.price), video.currency)}
        </span>
        <span className="text-muted-foreground">
          {' '}
          &bull; {video.access_duration_days} days access
        </span>
      </div>
    </div>
  )

  // If not ready yet, show processing state
  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        {metadataSection}
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            {t('notReady')}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Free preview section (visible to everyone if preview clip exists)
  const previewSection = video.preview_mux_playback_id ? (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t('freePreview')}
      </h3>
      <PreviewPlayer
        playbackId={video.preview_mux_playback_id}
        title={`${video.title} - Preview`}
      />
    </div>
  ) : null

  // If not logged in, ask them to sign in
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        {metadataSection}
        {previewSection}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-muted-foreground">
              {t('signInToWatch')}
            </div>
            <Button asChild>
              <Link
                href={`/${locale}/auth/signin?next=/${locale}/${slug}/videos/${video.id}`}
              >
                {t('signIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Entitlement check via purchases table (RLS limits student to own rows)
  const nowIso = new Date().toISOString()
  const { data: purchase } = await supabase
    .from('video_purchases')
    .select('status, expires_at')
    .eq('video_class_id', video.id)
    .eq('student_id', user.id)
    .maybeSingle()

  const hasAccess =
    purchase?.status === 'active' &&
    (purchase.expires_at ? purchase.expires_at > nowIso : true)

  if (!hasAccess) {
    const isPending = purchase?.status === 'pending'
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        {metadataSection}
        {previewSection}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-muted-foreground">
              {isPending
                ? t('pending', { defaultValue: 'Payment pending' })
                : t('noAccess')}
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPending && <BuyVideoButton videoClassId={video.id} />}
              <Button variant="outline" asChild>
                <Link href={`/${locale}/${slug}/videos`}>
                  {t('backToVideos')}
                </Link>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {t('paymentComingSoon')}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const playbackToken = await signMuxPlaybackToken(playbackId!, {
    expiration: '15m',
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      {metadataSection}

      <VideoWatchPlayer
        playbackId={playbackId!}
        playbackToken={playbackToken}
        title={video.title}
      />

      <div className="text-xs text-muted-foreground">{t('securityNote')}</div>
    </div>
  )
}
