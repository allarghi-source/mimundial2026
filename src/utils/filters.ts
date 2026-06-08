import type { Match, Phase } from '../types'
import { getDayKey } from './dates'

export interface MatchFilters {
  phase?: Phase
  group?: string
  teamId?: string
  venueId?: string
  dateKey?: string
}

export function applyFilters(matches: Match[], filters: MatchFilters): Match[] {
  return matches.filter((m) => {
    if (filters.phase && m.phase !== filters.phase) return false
    if (filters.group && m.group !== filters.group) return false
    if (filters.teamId && m.homeTeamId !== filters.teamId && m.awayTeamId !== filters.teamId) return false
    if (filters.venueId && m.venueId !== filters.venueId) return false
    if (filters.dateKey && getDayKey(m.date) !== filters.dateKey) return false
    return true
  })
}

export function groupMatchesByDay(matches: Match[]): Map<string, Match[]> {
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date))
  const grouped = new Map<string, Match[]>()
  for (const m of sorted) {
    const key = getDayKey(m.date)
    const list = grouped.get(key) ?? []
    list.push(m)
    grouped.set(key, list)
  }
  return grouped
}

export function getTeamMatches(matches: Match[], teamId: string): Match[] {
  return matches
    .filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getVenueMatches(matches: Match[], venueId: string): Match[] {
  return matches
    .filter((m) => m.venueId === venueId)
    .sort((a, b) => a.date.localeCompare(b.date))
}
