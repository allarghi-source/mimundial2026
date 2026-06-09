import type { Phase } from '../types'

export interface MatchScore {
  points: number
  exact: boolean
  correctOutcome: boolean
}

export function scoreMatch(
  pronoHome: number,
  pronoAway: number,
  realHome: number,
  realAway: number
): MatchScore {
  if (pronoHome === realHome && pronoAway === realAway) {
    return { points: 3, exact: true, correctOutcome: true }
  }
  const pronoOutcome = Math.sign(pronoHome - pronoAway)
  const realOutcome = Math.sign(realHome - realAway)
  const correctOutcome = pronoOutcome === realOutcome
  return { points: correctOutcome ? 1 : 0, exact: false, correctOutcome }
}

export interface PhaseStats {
  phase: Phase
  evaluated: number
  exact: number
  correctOutcome: number
  errors: number
  points: number
}

export interface GlobalStats {
  totalPoints: number
  evaluated: number
  exact: number
  correctOutcome: number
  errors: number
  byPhase: PhaseStats[]
}

export const PHASE_ORDER: Phase[] = [
  'group', 'round32', 'round16', 'quarterfinal', 'semifinal', 'third_place', 'final',
]
