import type { PaletteSeed } from '@/src/engine'

export type SharePayload = {
  name?: string
  seed: PaletteSeed[]
}

const isPaletteSeed = (value: unknown): value is PaletteSeed => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as PaletteSeed
  if (typeof candidate.index !== 'number') return false
  if (typeof candidate.semantic !== 'string') return false
  if (candidate.keys === null) return true
  if (!Array.isArray(candidate.keys)) return false
  return candidate.keys.every((item) => typeof item === 'string')
}

export const isSharePayload = (value: unknown): value is SharePayload => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as SharePayload
  if (!Array.isArray(candidate.seed)) return false
  if (candidate.name !== undefined && typeof candidate.name !== 'string') {
    return false
  }
  return candidate.seed.every(isPaletteSeed)
}

const encodeBase64 = (value: string) =>
  btoa(unescape(encodeURIComponent(value)))
const decodeBase64 = (value: string) => decodeURIComponent(escape(atob(value)))

export const encodeSharePayload = (payload: SharePayload) => {
  const json = JSON.stringify(payload)
  return encodeURIComponent(encodeBase64(json))
}

export const decodeSharePayload = (value: string) => {
  try {
    const base64 = decodeURIComponent(value)
    const json = decodeBase64(base64)
    const parsed = JSON.parse(json) as unknown
    return isSharePayload(parsed) ? parsed : null
  } catch {
    return null
  }
}
