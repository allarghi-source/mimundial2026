import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const ART_OFFSET = -3 * 60

function toArgentinaDate(utcDate: Date): Date {
  const utcMs = utcDate.getTime()
  const localOffset = utcDate.getTimezoneOffset()
  return new Date(utcMs + (localOffset + ART_OFFSET) * 60 * 1000)
}

export function parseMatchDate(isoString: string): Date {
  return parseISO(isoString)
}

export function toART(isoString: string): Date {
  return toArgentinaDate(parseISO(isoString))
}

export function formatMatchTime(isoString: string): string {
  const d = toART(isoString)
  return format(d, 'HH:mm')
}

export function formatMatchDate(isoString: string): string {
  const d = toART(isoString)
  return format(d, 'd MMM', { locale: es }).toUpperCase()
}

export function formatMatchDateTime(isoString: string): string {
  const d = toART(isoString)
  const dayOfWeek = format(d, 'EEEE', { locale: es })
  const dayMonth = format(d, 'd MMM', { locale: es }).toUpperCase()
  const time = format(d, 'HH:mm')
  return `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} ${dayMonth} · ${time}`
}

export function formatDayHeader(isoString: string): string {
  const d = toART(isoString)

  if (isToday(d)) return 'Hoy'
  if (isTomorrow(d)) return 'Mañana'

  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export function isTodayMatch(isoString: string): boolean {
  return isToday(toART(isoString))
}

export function isTomorrowMatch(isoString: string): boolean {
  return isTomorrow(toART(isoString))
}

export function isInNextDays(isoString: string, days: number): boolean {
  const d = toART(isoString)
  const today = startOfDay(new Date())
  const limit = addDays(today, days)
  return d >= today && d < limit
}

export function getDayKey(isoString: string): string {
  const d = toART(isoString)
  return format(d, 'yyyy-MM-dd')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
