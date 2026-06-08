import { useNavigate } from 'react-router-dom'
import type { Venue } from '../types'

interface Props {
  venue: Venue
  matchCount?: number
}

export default function VenueCard({ venue, matchCount }: Props) {
  const navigate = useNavigate()

  const flag =
    venue.country === 'México'
      ? '🇲🇽'
      : venue.country === 'Canadá'
      ? '🇨🇦'
      : '🇺🇸'

  return (
    <div
      className="bg-surface-2 border border-rim rounded-xl p-4 cursor-pointer active:opacity-80"
      onClick={() => navigate(`/venues/${venue.id}`)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{flag}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate">{venue.name}</p>
          <p className="text-sm text-ink-2 mt-0.5">
            {venue.city} · {venue.country}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-ink-3">
              🏟 {venue.capacity.toLocaleString()} esp.
            </span>
            {matchCount !== undefined && (
              <span className="text-xs text-ink-3">⚽ {matchCount} partidos</span>
            )}
          </div>
        </div>
        <span className="text-ink-3 text-lg">›</span>
      </div>
    </div>
  )
}
