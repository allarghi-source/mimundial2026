import { useState } from 'react'
import { useStandings } from '../hooks/useStandings'
import { useData } from '../hooks/useData'
import TeamFlag from '../components/TeamFlag'
import type { GroupStanding } from '../types'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function StandingsTable({ group, rows }: { group: string; rows: GroupStanding[] }) {
  const { getTeam } = useData()

  return (
    <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden mb-4">
      <div className="bg-surface-3 px-4 py-2 flex items-center gap-2">
        <span className="text-gold font-bold text-sm">Grupo {group}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-ink-3 border-b border-rim">
            <th className="text-left px-3 py-2 w-8">#</th>
            <th className="text-left px-1 py-2">Equipo</th>
            <th className="py-2 w-8 text-center">PJ</th>
            <th className="py-2 w-8 text-center font-bold text-ink">PTS</th>
            <th className="py-2 w-8 text-center">PG</th>
            <th className="py-2 w-8 text-center">PE</th>
            <th className="py-2 w-8 text-center">PP</th>
            <th className="py-2 w-8 text-center">GF</th>
            <th className="py-2 w-8 text-center">GC</th>
            <th className="py-2 w-8 text-center pr-3">DG</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const team = getTeam(row.teamId)
            const rowColor =
              idx < 2
                ? 'border-l-2 border-l-green-500'
                : idx === 2
                ? 'border-l-2 border-l-yellow-500'
                : 'border-l-2 border-l-transparent'

            return (
              <tr key={row.teamId} className={`border-b border-rim/50 last:border-0 ${rowColor}`}>
                <td className="px-3 py-2 text-ink-3 text-center">{row.position}</td>
                <td className="px-1 py-2">
                  <div className="flex items-center gap-1.5">
                    <TeamFlag countryCode={team?.countryCode} size={22} />
                    <span className="text-ink font-medium">{team?.code ?? row.teamId}</span>
                  </div>
                </td>
                <td className="py-2 text-center text-ink-3">{row.pj}</td>
                <td className="py-2 text-center font-bold text-gold">{row.pts}</td>
                <td className="py-2 text-center text-ink-3">{row.pg}</td>
                <td className="py-2 text-center text-ink-3">{row.pe}</td>
                <td className="py-2 text-center text-ink-3">{row.pp}</td>
                <td className="py-2 text-center text-ink-3">{row.gf}</td>
                <td className="py-2 text-center text-ink-3">{row.gc}</td>
                <td className="py-2 text-center pr-3 text-ink-3">{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Standings() {
  const { standings } = useStandings()
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="text-xl font-bold text-ink mb-4">Posiciones</h1>

      {/* Group filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setActiveGroup(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeGroup === null ? 'bg-gold text-night' : 'bg-surface-2 text-ink-3 border border-rim'
          }`}
        >
          Todos
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeGroup === g ? 'bg-gold text-night' : 'bg-surface-2 text-ink-3 border border-rim'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-3 bg-green-500 rounded-sm inline-block" />
          Clasifica
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-3 bg-yellow-500 rounded-sm inline-block" />
          Posible 3ro
        </span>
      </div>

      {/* Tables */}
      {GROUPS.filter((g) => activeGroup === null || activeGroup === g).map((g) => {
        const rows = standings.get(g) ?? []
        return <StandingsTable key={g} group={g} rows={rows} />
      })}
    </div>
  )
}
