import { useMemo } from 'react'
import { useData } from '../hooks/useData'
import { useAppStore } from '../store/appStore'
import PageHeader from '../components/PageHeader'
import MatchCard from '../components/MatchCard'
import EmptyState from '../components/EmptyState'
import SectionTitle from '../components/SectionTitle'

export default function Favorites() {
  const { matches } = useData()
  const favorites = useAppStore((s) => s.favorites)

  const favoriteMatches = useMemo(
    () =>
      matches
        .filter((m) => favorites.has(m.id))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [matches, favorites]
  )

  const upcoming = favoriteMatches.filter((m) => m.status !== 'finished')
  const played = favoriteMatches.filter((m) => m.status === 'finished')

  return (
    <div>
      <PageHeader title="Favoritos" />
      <div className="px-4 pt-4 pb-4">
        {favoriteMatches.length === 0 ? (
          <EmptyState
            icon="⭐"
            title="Sin favoritos aún"
            description="Tocá la estrella en cualquier partido para guardarlo acá"
          />
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <section>
                <SectionTitle title="Próximos" />
                <div className="space-y-3">
                  {upcoming.map((m) => (
                    <MatchCard key={m.id} match={m} showDate />
                  ))}
                </div>
              </section>
            )}
            {played.length > 0 && (
              <section>
                <SectionTitle title="Jugados" />
                <div className="space-y-3">
                  {played.map((m) => (
                    <MatchCard key={m.id} match={m} showDate />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
