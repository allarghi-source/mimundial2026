import type { Match, Team, Venue } from '../types'

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function searchTeams(teams: Team[], query: string): Team[] {
  if (!query.trim()) return teams
  const q = normalize(query)
  return teams.filter(
    (t) =>
      normalize(t.name).includes(q) ||
      normalize(t.code).includes(q) ||
      normalize(t.confederation).includes(q)
  )
}

export function searchVenues(venues: Venue[], query: string): Venue[] {
  if (!query.trim()) return venues
  const q = normalize(query)
  return venues.filter(
    (v) =>
      normalize(v.name).includes(q) ||
      normalize(v.city).includes(q) ||
      normalize(v.country).includes(q)
  )
}

export function searchMatches(
  matches: Match[],
  query: string,
  teamsMap: Map<string, Team>
): Match[] {
  if (!query.trim()) return matches
  const q = normalize(query)
  return matches.filter((m) => {
    const home = teamsMap.get(m.homeTeamId)
    const away = teamsMap.get(m.awayTeamId)
    if (!home || !away) return false
    return (
      normalize(home.name).includes(q) ||
      normalize(away.name).includes(q) ||
      normalize(home.code).includes(q) ||
      normalize(away.code).includes(q)
    )
  })
}
