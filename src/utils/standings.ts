import type { Match, MatchResult, GroupStanding } from '../types'

export function computeGroupStandings(
  matches: Match[],
  results: Map<string, MatchResult>
): Map<string, GroupStanding[]> {
  const groups = new Map<string, Map<string, GroupStanding>>()

  // Initialize all teams from group matches
  for (const m of matches) {
    if (m.phase !== 'group' || !m.group) continue
    if (!groups.has(m.group)) groups.set(m.group, new Map())
    const g = groups.get(m.group)!
    for (const teamId of [m.homeTeamId, m.awayTeamId]) {
      if (!g.has(teamId)) {
        g.set(teamId, { teamId, group: m.group, position: 0, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0 })
      }
    }
  }

  // Apply results
  for (const m of matches) {
    if (m.phase !== 'group' || !m.group) continue
    const res = results.get(m.id)
    if (!res) continue
    const g = groups.get(m.group)!
    const home = g.get(m.homeTeamId)!
    const away = g.get(m.awayTeamId)!
    const hg = res.homeScore
    const ag = res.awayScore

    home.pj++; away.pj++
    home.gf += hg; home.gc += ag; home.dg += hg - ag
    away.gf += ag; away.gc += hg; away.dg += ag - hg

    if (hg > ag) {
      home.pg++; home.pts += 3; away.pp++
    } else if (ag > hg) {
      away.pg++; away.pts += 3; home.pp++
    } else {
      home.pe++; home.pts++; away.pe++; away.pts++
    }
  }

  // Sort and assign positions — ties beyond PTS/DG/GF are kept as-is (manual control)
  const output = new Map<string, GroupStanding[]>()
  for (const [group, gMap] of groups) {
    const sorted = [...gMap.values()].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.dg !== a.dg) return b.dg - a.dg
      return b.gf - a.gf
    })

    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        sorted[i].position = 1
      } else {
        const prev = sorted[i - 1]
        const curr = sorted[i]
        const tied = curr.pts === prev.pts && curr.dg === prev.dg && curr.gf === prev.gf
        sorted[i].position = tied ? prev.position : i + 1
      }
    }

    output.set(group, sorted)
  }

  return output
}
