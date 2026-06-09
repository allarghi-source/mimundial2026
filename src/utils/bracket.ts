import type { Match, MatchResult, GroupStanding, QualifiedThird } from '../types'

export function resolveSlot(
  slot: string,
  standings: Map<string, GroupStanding[]>,
  qualifiedThirds: Map<string, QualifiedThird>,
  results: Map<string, MatchResult>,
  matchesMap: Map<string, Match>
): string | null {
  // Group position: "1A", "2B", "3C", etc.
  const groupPos = slot.match(/^([1-4])([A-L])$/)
  if (groupPos) {
    const pos = parseInt(groupPos[1])
    const group = groupPos[2]
    const s = standings.get(group) ?? []
    const team = s.find(t => t.position === pos)
    // Only resolve if the team has actually played — pj=0 means no results loaded yet
    if (!team || team.pj === 0) return null
    return team.teamId
  }

  // Third qualifier slot: "3rd_1" .. "3rd_8"
  if (slot.startsWith('3rd_')) {
    return qualifiedThirds.get(slot)?.teamId ?? null
  }

  // Winner: "W73" .. "W102"
  const winner = slot.match(/^W(\d+)$/)
  if (winner) {
    const matchId = `m${winner[1].padStart(3, '0')}`
    return resolveMatchWinner(matchId, true, standings, qualifiedThirds, results, matchesMap)
  }

  // Loser: "L101", "L102"
  const loser = slot.match(/^L(\d+)$/)
  if (loser) {
    const matchId = `m${loser[1].padStart(3, '0')}`
    return resolveMatchWinner(matchId, false, standings, qualifiedThirds, results, matchesMap)
  }

  return null
}

function resolveMatchWinner(
  matchId: string,
  wantWinner: boolean,
  standings: Map<string, GroupStanding[]>,
  qualifiedThirds: Map<string, QualifiedThird>,
  results: Map<string, MatchResult>,
  matchesMap: Map<string, Match>
): string | null {
  const match = matchesMap.get(matchId)
  const result = results.get(matchId)
  if (!match || !result) return null

  const { homeScore, awayScore } = result
  if (homeScore === awayScore) return null

  const winnerSlot = homeScore > awayScore ? match.homeSlot : match.awaySlot
  const loserSlot = homeScore > awayScore ? match.awaySlot : match.homeSlot
  const winnerTeamId = homeScore > awayScore ? match.homeTeamId : match.awayTeamId
  const loserTeamId = homeScore > awayScore ? match.awayTeamId : match.homeTeamId

  const targetSlot = wantWinner ? winnerSlot : loserSlot
  const fallbackId = wantWinner ? winnerTeamId : loserTeamId

  if (targetSlot) {
    return resolveSlot(targetSlot, standings, qualifiedThirds, results, matchesMap)
  }
  return fallbackId !== 'tbd' ? fallbackId : null
}
