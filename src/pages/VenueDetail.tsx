import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useData } from '../hooks/useData'
import PageHeader from '../components/PageHeader'
import MatchCard from '../components/MatchCard'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import SectionTitle from '../components/SectionTitle'
import { getVenueMatches } from '../utils/filters'

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>()
  const { venues, matches } = useData()

  const venue = useMemo(() => venues.find((v) => v.id === id), [venues, id])
  const venueMatches = useMemo(
    () => (id ? getVenueMatches(matches, id) : []),
    [matches, id]
  )

  if (!venue) {
    return (
      <div>
        <PageHeader title="Sede" back />
        <EmptyState icon="❌" title="Sede no encontrada" />
      </div>
    )
  }

  const flag =
    venue.country === 'México' ? '🇲🇽' : venue.country === 'Canadá' ? '🇨🇦' : '🇺🇸'

  const upcoming = venueMatches.filter((m) => m.status !== 'finished')
  const played = venueMatches.filter((m) => m.status === 'finished')

  return (
    <div>
      <PageHeader title={venue.name} back />
      <div className="px-4 pt-6 pb-4">
        <div className="mb-6">
          <span className="text-5xl mb-3 block">{flag}</span>
          <h2 className="text-xl font-bold text-ink">{venue.name}</h2>
          <p className="text-sm text-ink-3 mt-1">
            {venue.city} · {venue.country}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Capacidad" value={venue.capacity.toLocaleString()} icon="🏟" />
          <StatCard label="Partidos" value={venueMatches.length} icon="⚽" />
          <StatCard label="Jugados" value={played.length} icon="✅" />
        </div>

        {upcoming.length > 0 && (
          <section className="mb-6">
            <SectionTitle title="Próximos partidos" />
            <div className="space-y-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </div>
          </section>
        )}

        {played.length > 0 && (
          <section>
            <SectionTitle title="Partidos jugados" />
            <div className="space-y-3">
              {played.map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
