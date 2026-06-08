import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../utils/logo/logo.jpg'
import { useData } from '../hooks/useData'
import { useAppStore } from '../store/appStore'
import MatchCard from '../components/MatchCard'
import SectionTitle from '../components/SectionTitle'
import EmptyState from '../components/EmptyState'
import { isTodayMatch, isTomorrowMatch, isInNextDays } from '../utils/dates'

export default function Home() {
  const navigate = useNavigate()
  const { matches } = useData()
  const favorites = useAppStore((s) => s.favorites)

  const todayMatches = useMemo(
    () => matches.filter((m) => isTodayMatch(m.date)),
    [matches]
  )

  const tomorrowMatches = useMemo(
    () => matches.filter((m) => isTomorrowMatch(m.date)),
    [matches]
  )

  const weekMatches = useMemo(
    () =>
      matches
        .filter((m) => isInNextDays(m.date, 7) && !isTodayMatch(m.date) && !isTomorrowMatch(m.date))
        .slice(0, 8),
    [matches]
  )

  const favoriteMatches = useMemo(
    () => matches.filter((m) => favorites.has(m.id)).slice(0, 4),
    [matches, favorites]
  )

  const quickLinks = [
    { to: '/fixture', icon: '📅', label: 'Fixture' },
    { to: '/teams', icon: '🌍', label: 'Equipos' },
    { to: '/venues', icon: '🏟', label: 'Sedes' },
    { to: '/calendar', icon: '📆', label: 'Calendario' },
  ]

  return (
    <div>
      <div
        className="flex flex-col items-center text-center px-4 pb-6"
        style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}
      >
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold/70 mb-1">
          FIFA World Cup™
        </p>
        <h1 className="text-3xl font-black tracking-tight text-ink mb-1">
          Mi Mundial 2026
        </h1>
        <p className="text-[10px] text-ink-3 tracking-widest uppercase mb-4">
          creada por ALL
        </p>
        <img
          src={logo}
          alt="Mi Mundial 2026"
          className="h-28 w-auto object-contain drop-shadow-[0_4px_24px_rgba(212,175,55,0.35)]"
        />
        <p className="text-xs text-ink-3 mt-4 tracking-wide">
          11 Jun – 19 Jul · 48 equipos · 104 partidos
        </p>
      </div>

      <div className="px-4 grid grid-cols-4 gap-2 mb-6">
        {quickLinks.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="bg-surface-2 border border-rim rounded-xl py-3 flex flex-col items-center gap-1.5 active:opacity-70"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] text-ink-2 font-medium">{link.label}</span>
          </button>
        ))}
      </div>

      <div className="px-4 space-y-6">
        <section>
          <SectionTitle title="Hoy juegan" />
          {todayMatches.length === 0 ? (
            <EmptyState icon="📅" title="No hay partidos hoy" />
          ) : (
            <div className="space-y-3">
              {todayMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionTitle title="Mañana juegan" />
          {tomorrowMatches.length === 0 ? (
            <EmptyState icon="📅" title="No hay partidos mañana" />
          ) : (
            <div className="space-y-3">
              {tomorrowMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionTitle title="Próximos 7 días" linkTo="/fixture" />
          {weekMatches.length === 0 ? (
            <EmptyState icon="🔭" title="No hay partidos esta semana" />
          ) : (
            <div className="space-y-3">
              {weekMatches.map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </div>
          )}
        </section>

        {favoriteMatches.length > 0 && (
          <section>
            <SectionTitle title="Mis favoritos" linkTo="/favorites" />
            <div className="space-y-3">
              {favoriteMatches.map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
