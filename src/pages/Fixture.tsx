import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import PageHeader from '../components/PageHeader'
import MatchCard from '../components/MatchCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import SectionTitle from '../components/SectionTitle'
import EmptyState from '../components/EmptyState'
import type { Phase } from '../types'
import { PHASE_LABELS } from '../types'
import { groupMatchesByDay, applyFilters } from '../utils/filters'
import { searchMatches } from '../utils/search'
import { formatDayHeader, capitalize } from '../utils/dates'

const PHASE_OPTIONS = [
  { value: '', label: 'Todos' },
  ...(['group', 'round32', 'round16', 'quarterfinal', 'semifinal', 'third_place', 'final'] as Phase[]).map(
    (p) => ({ value: p, label: PHASE_LABELS[p] })
  ),
]

export default function Fixture() {
  const { matches, teamsMap } = useData()
  const [search, setSearch] = useState('')
  const [phase, setPhase] = useState('')

  const filtered = useMemo(() => {
    let result = applyFilters(matches, { phase: phase as Phase | undefined || undefined })
    result = searchMatches(result, search, teamsMap)
    return result
  }, [matches, phase, search, teamsMap])

  const grouped = useMemo(() => groupMatchesByDay(filtered), [filtered])

  return (
    <div>
      <PageHeader title="Fixture" />
      <div className="px-4 pt-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar equipo..." />
        <FilterBar options={PHASE_OPTIONS} value={phase} onChange={setPhase} />
      </div>

      <div className="px-4 pt-4 pb-4 space-y-6">
        {grouped.size === 0 ? (
          <EmptyState icon="🔍" title="Sin resultados" description="Intentá con otro filtro o búsqueda" />
        ) : (
          [...grouped.entries()].map(([dayKey, dayMatches]) => (
            <section key={dayKey}>
              <SectionTitle title={capitalize(formatDayHeader(dayMatches[0].date))} />
              <div className="space-y-3">
                {dayMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
