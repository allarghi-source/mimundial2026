import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import PageHeader from '../components/PageHeader'
import TeamCard from '../components/TeamCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import { searchTeams } from '../utils/search'

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

const GROUP_OPTIONS = [
  { value: '', label: 'Todos' },
  ...GROUPS.map((g) => ({ value: g, label: `Grupo ${g}` })),
]

export default function Teams() {
  const { teams } = useData()
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('')

  const playingTeams = useMemo(() => teams.filter((t) => t.id !== 'tbd'), [teams])

  const filtered = useMemo(() => {
    let result = group ? playingTeams.filter((t) => t.group === group) : playingTeams
    result = searchTeams(result, search)
    return result
  }, [playingTeams, group, search])

  return (
    <div>
      <PageHeader title="Selecciones" />
      <div className="px-4 pt-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar selección..." />
        <FilterBar options={GROUP_OPTIONS} value={group} onChange={setGroup} />
      </div>
      <div className="px-4 pt-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon="🌍" title="No se encontraron equipos" />
        ) : (
          filtered.map((t) => <TeamCard key={t.id} team={t} />)
        )}
      </div>
    </div>
  )
}
