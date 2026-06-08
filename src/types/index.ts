export interface Team {
  id: string
  name: string
  code: string
  flag: string
  countryCode?: string
  group?: string
  confederation: string
}

export interface Venue {
  id: string
  name: string
  city: string
  country: string
  capacity: number
}

export type Phase =
  | 'group'
  | 'round32'
  | 'round16'
  | 'quarterfinal'
  | 'semifinal'
  | 'third_place'
  | 'final'

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeSlot?: string
  awaySlot?: string
  venueId: string
  date: string
  phase: Phase
  group?: string
  matchDay?: number
  status: MatchStatus
  homeScore?: number
  awayScore?: number
}

export interface UserPreferences {
  theme: 'dark' | 'light'
  favoriteTeams: string[]
  notifications: boolean
}

export interface Favorite {
  matchId: string
  createdAt: string
}

export interface PersonalEvent {
  matchId: string
  wantToWatch: boolean
  watched: boolean
  note?: string
  userHomeScore?: number
  userAwayScore?: number
}

export interface MatchResult {
  matchId: string
  homeScore: number
  awayScore: number
}

export interface GroupStanding {
  teamId: string
  group: string
  position: number
  pts: number
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dg: number
}

export interface QualifiedThird {
  slot: string
  teamId: string
}

export const PHASE_LABELS: Record<Phase, string> = {
  group: 'Fase de Grupos',
  round32: 'Dieciseisavos de Final',
  round16: 'Octavos de Final',
  quarterfinal: 'Cuartos de Final',
  semifinal: 'Semifinal',
  third_place: 'Tercer Puesto',
  final: 'Final',
}
