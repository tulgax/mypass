'use client'

import MuxPlayer from '@mux/mux-player-react'

export function VideoPreviewPlayer({
  playbackId,
  playbackToken,
  title,
}: {
  playbackId: string
  playbackToken: string
  title: string
}) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={{ playback: playbackToken }}
      streamType="on-demand"
      videoTitle={title}
      style={{ width: '100%', aspectRatio: '16 / 9' }}
    />
  )
}
