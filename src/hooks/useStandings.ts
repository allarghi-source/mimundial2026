import { useMemo } from 'react'
import { useAppStore } from '../store/appStore'
import { useData } from './useData'
import { computeGroupStandings } from '../utils/standings'
import { resolveSlot as resolveSlotFn } from '../utils/bracket'
import type { Team } from '../types'

export function useStandings() {
  const { matches } = useData()
  const matchResults = useAppStore((s) => s.matchResults)

  const standings = useMemo(
    () => computeGroupStandings(matches, matchResults),
    [matches, matchResults]
  )

  return { standings }
}

export function useBracket() {
  const { matches, teamsMap } = useData()
  const matchResults = useAppStore((s) => s.matchResults)
  const qualifiedThirds = useAppStore((s) => s.qualifiedThirds)

  const matchesMap = useMemo(
    () => new Map(matches.map((m) => [m.id, m])),
    [matches]
  )

  const standings = useMemo(
    () => computeGroupStandings(matches, matchResults),
    [matches, matchResults]
  )

  const resolveSlot = useMemo(
    () => (slot: string): string | null =>
      resolveSlotFn(slot, standings, qualifiedThirds, matchResults, matchesMap),
    [standings, qualifiedThirds, matchResults, matchesMap]
  )

  const resolveTeam = useMemo(
    () =>
      (slot: string): Team | null => {
        const teamId = resolveSlot(slot)
        return teamId ? (teamsMap.get(teamId) ?? null) : null
      },
    [resolveSlot, teamsMap]
  )

  return { resolveSlot, resolveTeam }
}
