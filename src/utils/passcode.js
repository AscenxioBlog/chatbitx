const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generatePasscode(length = 6) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}
