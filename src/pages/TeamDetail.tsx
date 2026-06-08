import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useData } from '../hooks/useData'
import PageHeader from '../components/PageHeader'
import MatchCard from '../components/MatchCard'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import SectionTitle from '../components/SectionTitle'
import { getTeamMatches } from '../utils/filters'

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>()
  const { teams, matches, teamsMap } = useData()

  const team = useMemo(() => teams.find((t) => t.id === id), [teams, id])
  const teamMatches = useMemo(
    () => (id ? getTeamMatches(matches, id) : []),
    [matches, id]
  )

  const played = teamMatches.filter((m) => m.status === 'finished')
  const upcoming = teamMatches.filter((m) => m.status === 'scheduled' || m.status === 'live')

  const wins = played.filter((m) => {
    const isHome = m.homeTeamId === id
    const hs = m.homeScore ?? 0
    const as = m.awayScore ?? 0
    return isHome ? hs > as : as > hs
  }).length

  if (!team) {
    return (
      <div>
        <PageHeader title="Selección" back />
        <EmptyState icon="❌" title="Equipo no encontrado" />
      </div>
    )
  }

  const groupmates = team.group
    ? teams.filter((t) => t.group === team.group && t.id !== team.id && t.id !== 'tbd')
    : []

  return (
    <div>
      <PageHeader title={team.name} back />

      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">{team.flag}</span>
          <div>
            <h2 className="text-xl font-bold text-ink">{team.name}</h2>
            <p className="text-sm text-ink-3">{team.confederation}</p>
            {team.group && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-gold/20 text-gold text-xs font-bold rounded-full">
                Grupo {team.group}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Partidos" value={teamMatches.length} icon="⚽" />
          <StatCard label="Jugados" value={played.length} icon="✅" />
          <StatCard label="Victorias" value={wins} icon="🏆" />
        </div>

        {groupmates.length > 0 && (
          <div className="mb-6">
            <SectionTitle title={`Rivales Grupo ${team.group}`} />
            <div className="flex flex-wrap gap-2">
              {groupmates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 bg-surface-2 border border-rim rounded-lg px-3 py-2"
                >
                  <span>{t.flag}</span>
                  <span className="text-sm text-ink-2">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <section className="mb-6">
            <SectionTitle title="Próximos partidos" />
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </div>
          </section>
        )}

        {played.length > 0 && (
          <section>
            <SectionTitle title="Partidos jugados" />
            <div className="space-y-3">
              {played.map((m) => {
                const opponent = teamsMap.get(
                  m.homeTeamId === id ? m.awayTeamId : m.homeTeamId
                )
                return (
                  <div key={m.id} className="bg-surface-2 border border-rim rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">{opponent?.flag}</span>
                    <span className="flex-1 text-sm text-ink">{opponent?.name}</span>
                    <span className="text-sm font-bold text-gold">
                      {m.homeTeamId === id
                        ? `${m.homeScore} – ${m.awayScore}`
                        : `${m.awayScore} – ${m.homeScore}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
