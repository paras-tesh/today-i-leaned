import { fa } from './format.js'

export const levels = ['مبتدی', 'پیشرفته', 'فنگ‌شویی']

export const uid = () => Math.random().toString(36).slice(2, 9)

export const totalMinutes = (sessions) => sessions.reduce((sum, s) => sum + (s.minutes || 0), 0)

export function formatMinutes(total) {
  if (!total) return ''
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return [hours && `${fa(hours)} ساعت`, minutes && `${fa(minutes)} دقیقه`].filter(Boolean).join(' و ')
}

// Groups neighbouring sessions that share the same chapter title.
export function groupByChapter(sessions) {
  const groups = []
  sessions.forEach((session, index) => {
    const last = groups[groups.length - 1]
    if (last && last.title === session.chapter) last.items.push({ session, index })
    else groups.push({ title: session.chapter, items: [{ session, index }] })
  })
  return groups
}
