import { formatDistanceToNow, format, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function countdown(deadline) {
  const now = new Date()
  const end = new Date(deadline)
  const days = differenceInDays(end, now)
  const hours = differenceInHours(end, now) % 24
  const minutes = differenceInMinutes(end, now) % 60
  if (days < 0) return 'Closed'
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}
