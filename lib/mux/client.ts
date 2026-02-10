import fs from 'fs'
import path from 'path'

import Mux from '@mux/mux-node'

let muxClient: Mux | null = null

export function getMuxClient() {
  if (muxClient) return muxClient

  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET

  if (!tokenId) {
    throw new Error('Missing environment variable: MUX_TOKEN_ID')
  }
  if (!tokenSecret) {
    throw new Error('Missing environment variable: MUX_TOKEN_SECRET')
  }

  muxClient = new Mux({ tokenId, tokenSecret })
  return muxClient
}

/**
 * Normalize PEM private key from env (e.g. literal \n -> real newlines).
 * Fixes "DECODER routines::unsupported" when key is stored in .env with escaped newlines.
 */
function normalizePrivateKey(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) return trimmed
  return trimmed.replace(/\\n/g, '\n')
}

function loadPrivateKey(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  if (trimmed.includes('BEGIN ') || trimmed.includes('BEGIN RSA PRIVATE KEY')) {
    return normalizePrivateKey(trimmed)
  }

  const withoutFilePrefix = trimmed.startsWith('file:')
    ? trimmed.slice('file:'.length)
    : trimmed
  const resolvedPath = path.isAbsolute(withoutFilePrefix)
    ? withoutFilePrefix
    : path.resolve(process.cwd(), withoutFilePrefix)

  if (fs.existsSync(resolvedPath)) {
    return normalizePrivateKey(fs.readFileSync(resolvedPath, 'utf8'))
  }

  return normalizePrivateKey(trimmed)
}

/**
 * Mux signed playback requires a signing key pair from the Mux Dashboard (Settings → Signing keys),
 * not the API token. The private key must be PEM (PKCS1 or PKCS8) or base64-encoded PEM.
 * Env: MUX_SIGNING_KEY = key id, MUX_PRIVATE_KEY = private key PEM string.
 */
export function getMuxSigningKeys() {
  const keyId =
    process.env.MUX_SIGNING_KEY ??
    process.env.MUX_SIGNING_KEY_ID
  const raw =
    process.env.MUX_PRIVATE_KEY ??
    process.env.MUX_PRIVATE_KEY_FILE ??
    process.env.MUX_SIGNING_KEY_SECRET

  if (!keyId || !raw) {
    throw new Error(
      'Missing Mux signing keys for playback. Create a signing key at dashboard.mux.com/settings/signing-keys and set MUX_SIGNING_KEY (key id) and MUX_PRIVATE_KEY (private key PEM) in your environment.'
    )
  }

  return { keyId, keySecret: loadPrivateKey(raw) }
}

export function signMuxPlaybackToken(
  playbackId: string,
  opts?: { expiration?: string; type?: 'video' | 'thumbnail' | 'gif' | 'storyboard' }
) {
  const mux = getMuxClient()
  const { keyId, keySecret } = getMuxSigningKeys()
  return mux.jwt.signPlaybackId(playbackId, {
    keyId,
    keySecret,
    type: opts?.type ?? 'video',
    expiration: opts?.expiration ?? '15m',
  })
}

