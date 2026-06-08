import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useData } from '../hooks/useData'
import { useStandings } from '../hooks/useStandings'
import ResultModal from '../components/ResultModal'
import type { Match } from '../types'
import { PHASE_LABELS } from '../types'

const THIRD_SLOTS = ['3rd_1','3rd_2','3rd_3','3rd_4','3rd_5','3rd_6','3rd_7','3rd_8']
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function ResultsSection() {
  const { matches, getTeam } = useData()
  const matchResults = useAppStore((s) => s.matchResults)
  const clearAllResults = useAppStore((s) => s.clearAllResults)
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const withResults = matches.filter((m) => matchResults.has(m.id))

  function teamLabel(m: Match, side: 'home' | 'away') {
    const id = side === 'home' ? m.homeTeamId : m.awayTeamId
    const slot = side === 'home' ? m.homeSlot : m.awaySlot
    const team = getTeam(id)
    return team?.code ?? slot ?? id
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    await clearAllResults()
    setConfirmClear(false)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-ink">Resultados cargados</h2>
        {withResults.length > 0 && (
          <button
            onClick={() => void handleClearAll()}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              confirmClear
                ? 'bg-red-900/40 border-red-500 text-red-400'
                : 'border-rim text-ink-3'
            }`}
          >
            {confirmClear ? 'Confirmar borrar todo' : 'Borrar todos'}
          </button>
        )}
      </div>

      {withResults.length === 0 ? (
        <p className="text-ink-3 text-sm">No hay resultados cargados.</p>
      ) : (
        <div className="space-y-2">
          {withResults.map((m) => {
            const res = matchResults.get(m.id)!
            const phase = m.phase === 'group'
              ? `G${m.group} · J${m.matchDay}`
              : PHASE_LABELS[m.phase]
            return (
              <div
                key={m.id}
                onClick={() => setEditMatch(m)}
                className="bg-surface-2 border border-rim rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer active:opacity-80"
              >
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-sm">{getTeam(m.homeTeamId)?.flag ?? '🏳'}</span>
                  <span className="text-sm font-medium text-ink">{teamLabel(m, 'home')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gold font-bold text-base">
                  <span>{res.homeScore}</span>
                  <span className="text-ink-3 font-light">–</span>
                  <span>{res.awayScore}</span>
                </div>
                <div className="flex-1 flex items-center justify-end gap-1.5">
                  <span className="text-sm font-medium text-ink">{teamLabel(m, 'away')}</span>
                  <span className="text-sm">{getTeam(m.awayTeamId)?.flag ?? '🏳'}</span>
                </div>
                <span className="text-xs text-ink-3 ml-1 whitespace-nowrap hidden sm:block">{phase}</span>
              </div>
            )
          })}
        </div>
      )}

      {editMatch && (
        <ResultModal match={editMatch} onClose={() => setEditMatch(null)} />
      )}
    </section>
  )
}

function ThirdsSection() {
  const { getTeam } = useData()
  const { standings } = useStandings()
  const qualifiedThirds = useAppStore((s) => s.qualifiedThirds)
  const saveQualifiedThird = useAppStore((s) => s.saveQualifiedThird)
  const removeQualifiedThird = useAppStore((s) => s.removeQualifiedThird)
  const clearQualifiedThirds = useAppStore((s) => s.clearQualifiedThirds)
  const [confirmClear, setConfirmClear] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  // Collect all 3rd place teams from standings
  const thirds = GROUPS.map((g) => {
    const rows = standings.get(g) ?? []
    const third = rows.find((r) => r.position === 3)
    return third ? { ...third, group: g } : null
  }).filter(Boolean) as Array<{ teamId: string; group: string; pts: number; dg: number; gf: number }>

  const assignedIds = new Set([...qualifiedThirds.values()].map((qt) => qt.teamId))

  async function handleAssign(slot: string, teamId: string) {
    await saveQualifiedThird(slot, teamId)
    setAssigning(null)
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    await clearQualifiedThirds()
    setConfirmClear(false)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-ink">Mejores terceros</h2>
        {qualifiedThirds.size > 0 && (
          <button
            onClick={() => void handleClearAll()}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              confirmClear
                ? 'bg-red-900/40 border-red-500 text-red-400'
                : 'border-rim text-ink-3'
            }`}
          >
            {confirmClear ? 'Confirmar borrar' : 'Limpiar todo'}
          </button>
        )}
      </div>

      <p className="text-xs text-ink-3 mb-4">
        Seleccioná los 8 mejores terceros y asignalos a cada slot del fixture.
      </p>

      {/* Available thirds */}
      <h3 className="text-xs font-semibold text-ink-2 uppercase tracking-wider mb-2">Terceros por grupo</h3>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {thirds.length === 0 ? (
          <p className="text-xs text-ink-3 col-span-2">Cargá resultados para ver los terceros.</p>
        ) : (
          thirds.map((t) => {
            const team = getTeam(t.teamId)
            const isAssigned = assignedIds.has(t.teamId)
            return (
              <div
                key={t.teamId}
                className={`bg-surface-2 border rounded-xl px-3 py-2 flex items-center gap-2 ${
                  isAssigned ? 'border-gold/60' : 'border-rim'
                }`}
              >
                <span className="text-xl">{team?.flag ?? '🏳'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{team?.code ?? t.teamId}</p>
                  <p className="text-xs text-ink-3">Gr.{t.group} · {t.pts}pts · DG{t.dg > 0 ? `+${t.dg}` : t.dg}</p>
                </div>
                {isAssigned && <span className="text-gold text-xs">✓</span>}
              </div>
            )
          })
        )}
      </div>

      {/* Slot assignments */}
      <h3 className="text-xs font-semibold text-ink-2 uppercase tracking-wider mb-2">Slots del bracket</h3>
      <div className="space-y-2">
        {THIRD_SLOTS.map((slot) => {
          const assigned = qualifiedThirds.get(slot)
          const team = assigned ? getTeam(assigned.teamId) : null

          return (
            <div key={slot} className="bg-surface-2 border border-rim rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-3 font-mono w-12">{slot}</span>

                {assigned && team ? (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-lg">{team.flag}</span>
                    <span className="text-sm font-medium text-ink">{team.code}</span>
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-ink-3 italic">Sin asignar</span>
                )}

                <div className="flex gap-2">
                  {assigning === slot ? (
                    <button
                      onClick={() => setAssigning(null)}
                      className="text-xs text-ink-3 px-2 py-1 border border-rim rounded-lg"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <button
                      onClick={() => setAssigning(slot)}
                      className="text-xs text-gold px-2 py-1 border border-gold/50 rounded-lg"
                    >
                      {assigned ? 'Cambiar' : 'Asignar'}
                    </button>
                  )}
                  {assigned && (
                    <button
                      onClick={() => void removeQualifiedThird(slot)}
                      className="text-xs text-ink-3 px-2 py-1 border border-rim rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Team picker dropdown */}
              {assigning === slot && thirds.length > 0 && (
                <div className="mt-3 border-t border-rim pt-3 space-y-1.5">
                  {thirds.map((t) => {
                    const tt = getTeam(t.teamId)
                    return (
                      <button
                        key={t.teamId}
                        onClick={() => void handleAssign(slot, t.teamId)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-surface-3 transition-colors text-left"
                      >
                        <span className="text-lg">{tt?.flag ?? '🏳'}</span>
                        <span className="text-sm font-medium text-ink">{tt?.code ?? t.teamId}</span>
                        <span className="text-xs text-ink-3 ml-auto">Gr.{t.group} · {t.pts}pts</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Admin() {
  const [tab, setTab] = useState<'results' | 'thirds'>('results')

  return (
    <div className="px-4 py-4 pb-24">
      <h1 className="text-xl font-bold text-ink mb-4">Admin</h1>

      {/* Tab selector */}
      <div className="flex bg-surface-2 rounded-xl p-1 mb-5 gap-1">
        {(['results', 'thirds'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t ? 'bg-gold text-night' : 'text-ink-3'
            }`}
          >
            {t === 'results' ? 'Resultados' : 'Mejores terceros'}
          </button>
        ))}
      </div>

      {tab === 'results' ? <ResultsSection /> : <ThirdsSection />}
    </div>
  )
}
