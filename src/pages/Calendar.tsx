import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { useAppStore } from '../store/appStore'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import SectionTitle from '../components/SectionTitle'
import { formatMatchDate, formatMatchTime } from '../utils/dates'

export default function Calendar() {
  const navigate = useNavigate()
  const { matches, getTeam, getVenue } = useData()
  const personalEvents = useAppStore((s) => s.personalEvents)
  const toggleWantToWatch = useAppStore((s) => s.toggleWantToWatch)
  const toggleWatched = useAppStore((s) => s.toggleWatched)

  const calendarMatches = useMemo(
    () =>
      matches
        .filter((m) => {
          const ev = personalEvents.get(m.id)
          return ev?.wantToWatch || ev?.watched || ev?.note
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
    [matches, personalEvents]
  )

  const wantToWatch = calendarMatches.filter((m) => personalEvents.get(m.id)?.wantToWatch && !personalEvents.get(m.id)?.watched)
  const watched = calendarMatches.filter((m) => personalEvents.get(m.id)?.watched)

  return (
    <div>
      <PageHeader title="Mi Calendario" />
      <div className="px-4 pt-4 pb-4">
        {calendarMatches.length === 0 ? (
          <EmptyState
            icon="📆"
            title="Tu calendario está vacío"
            description="En el detalle de cada partido podés marcarlo como 'Quiero verlo' o 'Visto'"
          />
        ) : (
          <div className="space-y-6">
            {wantToWatch.length > 0 && (
              <section>
                <SectionTitle title="Quiero ver" />
                <div className="space-y-3">
                  {wantToWatch.map((m) => {
                    const home = getTeam(m.homeTeamId)
                    const away = getTeam(m.awayTeamId)
                    const venue = getVenue(m.venueId)
                    const ev = personalEvents.get(m.id)
                    return (
                      <div
                        key={m.id}
                        className="bg-surface-2 border border-rim rounded-xl p-4"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(`/match/${m.id}`)}
                        >
                          <span className="text-2xl">{home?.flag}</span>
                          <span className="text-ink font-medium">vs</span>
                          <span className="text-2xl">{away?.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">
                              {home?.name} vs {away?.name}
                            </p>
                            <p className="text-xs text-ink-3">
                              {formatMatchDate(m.date)} · {formatMatchTime(m.date)} ART
                            </p>
                            {venue && (
                              <p className="text-xs text-ink-3">{venue.city}</p>
                            )}
                          </div>
                        </div>
                        {ev?.note && (
                          <p className="mt-2 text-xs text-ink-2 italic border-t border-rim pt-2">
                            📝 {ev.note}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => void toggleWatched(m.id)}
                            className="flex-1 py-1.5 rounded-lg bg-gold/20 text-gold text-xs font-semibold"
                          >
                            Marcar como visto
                          </button>
                          <button
                            onClick={() => void toggleWantToWatch(m.id)}
                            className="py-1.5 px-3 rounded-lg bg-surface-3 text-ink-2 text-xs font-semibold"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {watched.length > 0 && (
              <section>
                <SectionTitle title="Vistos" />
                <div className="space-y-2">
                  {watched.map((m) => {
                    const home = getTeam(m.homeTeamId)
                    const away = getTeam(m.awayTeamId)
                    const ev = personalEvents.get(m.id)
                    return (
                      <div
                        key={m.id}
                        className="bg-surface-2 border border-rim rounded-xl p-3 flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(`/match/${m.id}`)}
                      >
                        <span className="text-green-400 text-lg">✓</span>
                        <span className="text-xl">{home?.flag}</span>
                        <span className="text-sm text-ink-2 flex-1">
                          {home?.code} vs {away?.code}
                          {ev?.userHomeScore !== undefined && (
                            <span className="ml-2 text-gold font-bold">
                              {ev.userHomeScore}–{ev.userAwayScore}
                            </span>
                          )}
                        </span>
                        <span className="text-xl">{away?.flag}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
