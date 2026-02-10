'use client'

import MuxPlayer from '@mux/mux-player-react'

export function PreviewPlayer({
  playbackId,
  title,
}: {
  playbackId: string
  title: string
}) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      videoTitle={title}
      style={{ width: '100%', aspectRatio: '16 / 9' }}
    />
  )
}
