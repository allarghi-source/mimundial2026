import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import PageHeader from '../components/PageHeader'
import VenueCard from '../components/VenueCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import { searchVenues } from '../utils/search'

const COUNTRY_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'Estados Unidos', label: '🇺🇸 USA' },
  { value: 'México', label: '🇲🇽 México' },
  { value: 'Canadá', label: '🇨🇦 Canadá' },
]

export default function Venues() {
  const { venues, matches } = useData()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')

  const matchCountByVenue = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of matches) {
      counts.set(m.venueId, (counts.get(m.venueId) ?? 0) + 1)
    }
    return counts
  }, [matches])

  const filtered = useMemo(() => {
    let result = country ? venues.filter((v) => v.country === country) : venues
    result = searchVenues(result, search)
    return result
  }, [venues, country, search])

  return (
    <div>
      <PageHeader title="Sedes" />
      <div className="px-4 pt-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar sede o ciudad..." />
        <FilterBar options={COUNTRY_OPTIONS} value={country} onChange={setCountry} />
      </div>
      <div className="px-4 pt-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon="🏟" title="No se encontraron sedes" />
        ) : (
          filtered.map((v) => (
            <VenueCard key={v.id} venue={v} matchCount={matchCountByVenue.get(v.id)} />
          ))
        )}
      </div>
    </div>
  )
}
