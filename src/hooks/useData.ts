import { useMemo } from 'react'
import rawData from '../data/worldcup2026.json'
import type { Team, Venue, Match } from '../types'

const data = rawData as { teams: Team[]; venues: Venue[]; matches: Match[] }

export function useData() {
  const teamsMap = useMemo(
    () => new Map(data.teams.map((t) => [t.id, t])),
    []
  )
  const venuesMap = useMemo(
    () => new Map(data.venues.map((v) => [v.id, v])),
    []
  )

  return {
    teams: data.teams,
    venues: data.venues,
    matches: data.matches,
    teamsMap,
    venuesMap,
    getTeam: (id: string) => teamsMap.get(id),
    getVenue: (id: string) => venuesMap.get(id),
  }
}
