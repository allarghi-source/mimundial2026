import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Match } from '../types'
import { useData } from '../hooks/useData'
import { useBracket } from '../hooks/useStandings'
import { useAppStore } from '../store/appStore'
import { formatMatchTime, formatMatchDate } from '../utils/dates'
import { PHASE_LABELS } from '../types'
import FavoriteButton from './FavoriteButton'
import ResultModal from './ResultModal'
import TeamFlag from './TeamFlag'

interface Props {
  match: Match
  showDate?: boolean
}

export default function MatchCard({ match, showDate = false }: Props) {
  const navigate = useNavigate()
  const { getTeam, getVenue } = useData()
  const { resolveTeam } = useBracket()
  const isFavorite = useAppStore((s) => s.isFavorite(match.id))
  const result = useAppStore((s) => s.matchResults.get(match.id))
  const [showModal, setShowModal] = useState(false)

  const rawHome = getTeam(match.homeTeamId)
  const rawAway = getTeam(match.awayTeamId)
  const venue = getVenue(match.venueId)

  // For knockout matches, try to resolve slot to actual team
  const resolvedHome = match.homeSlot ? resolveTeam(match.homeSlot) : null
  const resolvedAway = match.awaySlot ? resolveTeam(match.awaySlot) : null
  const home = resolvedHome ?? rawHome
  const away = resolvedAway ?? rawAway

  // Display slot label when team not yet resolved
  const homeLabel = home?.code ?? match.homeSlot ?? 'TBD'
  const awayLabel = away?.code ?? match.awaySlot ?? 'TBD'

  const hasResult = result !== undefined
  const phaseLabel = match.phase === 'group'
    ? `Grupo ${match.group} · Fecha ${match.matchDay}`
    : PHASE_LABELS[match.phase]

  return (
    <>
      <div
        className="bg-surface-2 border border-rim rounded-xl p-4 active:opacity-80 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-ink-3 font-medium uppercase tracking-wider">
            {phaseLabel}
          </span>
          <div className="flex items-center gap-2">
            {hasResult && (
              <span className="text-xs text-green-400 font-medium">✓</span>
            )}
            <FavoriteButton matchId={match.id} active={isFavorite} />
            <button
              className="text-ink-3 text-xs px-1"
              onClick={(e) => { e.stopPropagation(); navigate(`/match/${match.id}`) }}
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <TeamFlag countryCode={home?.countryCode} size={40} />
            <span className="text-sm font-semibold text-ink text-center leading-tight">
              {homeLabel}
            </span>
          </div>

          <div className="flex flex-col items-center min-w-[80px]">
            {hasResult ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gold">{result.homeScore}</span>
                <span className="text-ink-2 text-lg">–</span>
                <span className="text-2xl font-bold text-gold">{result.awayScore}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gold">{formatMatchTime(match.date)}</span>
            )}
            {showDate && (
              <span className="text-xs font-bold text-white mt-1">{formatMatchDate(match.date)}</span>
            )}
            <span className="text-xs text-ink-3 mt-1">ART</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5">
            <TeamFlag countryCode={away?.countryCode} size={40} />
            <span className="text-sm font-semibold text-ink text-center leading-tight">
              {awayLabel}
            </span>
          </div>
        </div>

        {venue && (
          <div className="mt-3 pt-3 border-t border-rim flex items-center gap-1">
            <span className="text-xs text-ink-3">📍</span>
            <span className="text-xs text-ink-3">{venue.name}, {venue.city}</span>
          </div>
        )}
      </div>

      {showModal && (
        <ResultModal match={match} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
