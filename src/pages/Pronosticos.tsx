import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { useAppStore } from '../store/appStore'
import { useBracket } from '../hooks/useStandings'
import TeamFlag from '../components/TeamFlag'
import { formatMatchDate, formatMatchTime } from '../utils/dates'
import { scoreMatch, PHASE_ORDER, type GlobalStats, type PhaseStats } from '../utils/scoring'
import type { Match, Phase } from '../types'
import { PHASE_LABELS } from '../types'

// ── PronoCard ────────────────────────────────────────────────────────────────

interface PronoCardProps {
  match: Match
  finalized: boolean
}

function PronoCard({ match, finalized }: PronoCardProps) {
  const { getTeam } = useData()
  const { resolveTeam } = useBracket()
  const prono = useAppStore((s) => s.pronosticos.get(match.id))
  const result = useAppStore((s) => s.matchResults.get(match.id))
  const savePronostico = useAppStore((s) => s.savePronostico)

  const [localHome, setLocalHome] = useState(prono !== undefined ? String(prono.homeScore) : '')
  const [localAway, setLocalAway] = useState(prono !== undefined ? String(prono.awayScore) : '')

  const home = match.homeSlot ? resolveTeam(match.homeSlot) : getTeam(match.homeTeamId)
  const away = match.awaySlot ? resolveTeam(match.awaySlot) : getTeam(match.awayTeamId)
  const homeLabel = home?.code ?? match.homeSlot ?? 'TBD'
  const awayLabel = away?.code ?? match.awaySlot ?? 'TBD'

  const score = prono && result
    ? scoreMatch(prono.homeScore, prono.awayScore, result.homeScore, result.awayScore)
    : null

  function handleBlur() {
    if (finalized) return
    const h = parseInt(localHome)
    const a = parseInt(localAway)
    if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) {
      void savePronostico(match.id, h, a)
    }
  }

  const hasProno = prono !== undefined

  return (
    <div className={`bg-surface-2 border rounded-xl px-4 py-3 transition-colors ${
      score
        ? score.points === 3 ? 'border-green-700/60' : score.points === 1 ? 'border-yellow-700/60' : 'border-red-700/40'
        : hasProno ? 'border-gold/30' : 'border-rim'
    }`}>
      {/* Teams + inputs row */}
      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <TeamFlag countryCode={home?.countryCode} size={26} />
          <span className="text-sm font-semibold text-ink truncate">{homeLabel}</span>
        </div>

        {/* Score area */}
        {finalized ? (
          <div className="flex items-center gap-2 shrink-0">
            {hasProno ? (
              <>
                <span className="text-xl font-bold text-gold w-8 text-center">{prono!.homeScore}</span>
                <span className="text-ink-3">–</span>
                <span className="text-xl font-bold text-gold w-8 text-center">{prono!.awayScore}</span>
              </>
            ) : (
              <span className="text-xs text-ink-3 italic px-2">sin prono</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              min="0"
              max="99"
              inputMode="numeric"
              value={localHome}
              onChange={(e) => setLocalHome(e.target.value)}
              onBlur={handleBlur}
              placeholder="–"
              className="w-11 h-10 bg-surface-3 border border-rim rounded-lg text-center text-lg font-bold text-gold outline-none focus:border-gold"
            />
            <span className="text-ink-3 text-sm">–</span>
            <input
              type="number"
              min="0"
              max="99"
              inputMode="numeric"
              value={localAway}
              onChange={(e) => setLocalAway(e.target.value)}
              onBlur={handleBlur}
              placeholder="–"
              className="w-11 h-10 bg-surface-3 border border-rim rounded-lg text-center text-lg font-bold text-gold outline-none focus:border-gold"
            />
          </div>
        )}

        {/* Away */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-semibold text-ink truncate text-right">{awayLabel}</span>
          <TeamFlag countryCode={away?.countryCode} size={26} />
        </div>
      </div>

      {/* Comparison row — only when result + prono exist */}
      {score && result && prono && (
        <div className="mt-2 pt-2 border-t border-rim/50 flex items-center justify-between">
          <span className="text-xs text-ink-3">
            Real: <span className="text-ink font-semibold">{result.homeScore}–{result.awayScore}</span>
          </span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            score.points === 3
              ? 'bg-green-900/50 text-green-400'
              : score.points === 1
              ? 'bg-yellow-900/50 text-yellow-400'
              : 'bg-red-900/40 text-red-400'
          }`}>
            {score.points === 3 ? '✓ Exacto · 3 pts' : score.points === 1 ? '~ Resultado · 1 pt' : '✗ Error · 0 pts'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Stats tab ────────────────────────────────────────────────────────────────

function StatsTab({ stats }: { stats: GlobalStats }) {
  const accuracy = stats.evaluated > 0
    ? Math.round(((stats.exact + stats.correctOutcome) / stats.evaluated) * 100)
    : 0

  if (stats.evaluated === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">📊</span>
        <p className="text-ink font-semibold">Sin datos aún</p>
        <p className="text-sm text-ink-3 max-w-xs">
          Las estadísticas aparecen cuando hay pronósticos y resultados reales para comparar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total points hero */}
      <div className="bg-surface-2 border border-gold/30 rounded-2xl p-5 text-center">
        <p className="text-xs text-ink-3 uppercase tracking-widest mb-1">Puntuación total</p>
        <p className="text-5xl font-black text-gold">{stats.totalPoints}</p>
        <p className="text-sm text-ink-3 mt-1">puntos acumulados</p>

        {/* Progress bar */}
        <div className="mt-4 bg-surface-3 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all"
            style={{ width: `${accuracy}%` }}
          />
        </div>
        <p className="text-xs text-ink-3 mt-1.5">{accuracy}% de aciertos · {stats.evaluated} evaluados</p>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface-2 border border-green-700/40 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.exact}</p>
          <p className="text-[10px] text-ink-3 mt-0.5 uppercase tracking-wide">Exactos</p>
          <p className="text-[10px] text-green-400/70">{stats.exact * 3} pts</p>
        </div>
        <div className="bg-surface-2 border border-yellow-700/40 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.correctOutcome}</p>
          <p className="text-[10px] text-ink-3 mt-0.5 uppercase tracking-wide">Acertados</p>
          <p className="text-[10px] text-yellow-400/70">{stats.correctOutcome} pts</p>
        </div>
        <div className="bg-surface-2 border border-red-700/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
          <p className="text-[10px] text-ink-3 mt-0.5 uppercase tracking-wide">Errores</p>
          <p className="text-[10px] text-red-400/70">0 pts</p>
        </div>
      </div>

      {/* Per-phase table */}
      {stats.byPhase.length > 0 && (
        <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-rim bg-surface-3">
            <p className="text-xs font-semibold text-ink-2 uppercase tracking-wider">Por fase</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-ink-3 border-b border-rim">
                <th className="text-left px-4 py-2">Fase</th>
                <th className="text-center py-2 w-10">Eval</th>
                <th className="text-center py-2 w-10 text-green-400">✓</th>
                <th className="text-center py-2 w-10 text-yellow-400">~</th>
                <th className="text-center py-2 w-10 text-red-400">✗</th>
                <th className="text-center py-2 w-12 pr-4 text-gold font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {stats.byPhase.map((ps) => (
                <tr key={ps.phase} className="border-b border-rim/50 last:border-0">
                  <td className="px-4 py-2.5 text-ink-2">{PHASE_LABELS[ps.phase]}</td>
                  <td className="text-center py-2.5 text-ink-3">{ps.evaluated}</td>
                  <td className="text-center py-2.5 text-green-400">{ps.exact}</td>
                  <td className="text-center py-2.5 text-yellow-400">{ps.correctOutcome}</td>
                  <td className="text-center py-2.5 text-red-400">{ps.errors}</td>
                  <td className="text-center py-2.5 pr-4 font-bold text-gold">{ps.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Finalize modal ───────────────────────────────────────────────────────────

function FinalizeModal({ count, total, onConfirm, onCancel }: {
  count: number; total: number; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-surface-1 border border-rim rounded-t-2xl px-5 pt-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-rim rounded-full" />
        <p className="text-lg font-bold text-ink mb-2 mt-2">¿Finalizar pronósticos?</p>
        <p className="text-sm text-ink-3 mb-1">
          Tenés <span className="text-ink font-semibold">{count}</span> de <span className="text-ink font-semibold">{total}</span> pronósticos ingresados.
        </p>
        {count < total && (
          <p className="text-sm text-yellow-400 mb-4">
            Los {total - count} partidos sin pronóstico quedarán sin puntuar.
          </p>
        )}
        {count === total && (
          <p className="text-sm text-green-400 mb-4">¡Completaste todos los pronósticos!</p>
        )}
        <p className="text-sm text-ink-3 mb-6">
          Una vez finalizado <span className="text-ink font-medium">no podrás modificar</span> tus predicciones.
        </p>
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl font-bold text-night bg-gold"
          >
            Sí, finalizar pronósticos
          </button>
          <button onClick={onCancel} className="w-full py-2.5 text-sm text-ink-3">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

const PHASE_FILTERS: Array<{ value: Phase | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'group', label: 'Grupos' },
  { value: 'round32', label: '16avos' },
  { value: 'round16', label: 'Octavos' },
  { value: 'quarterfinal', label: 'Cuartos' },
  { value: 'semifinal', label: 'Semis' },
  { value: 'third_place', label: '3er Puesto' },
  { value: 'final', label: 'Final' },
]

export default function Pronosticos() {
  const { matches } = useData()
  const pronosticos = useAppStore((s) => s.pronosticos)
  const matchResults = useAppStore((s) => s.matchResults)
  const preferences = useAppStore((s) => s.preferences)
  const finalizePronosticos = useAppStore((s) => s.finalizePronosticos)

  const finalized = preferences.pronosticosFinalized ?? false

  const [tab, setTab] = useState<'pronos' | 'stats'>('pronos')
  const [phase, setPhase] = useState<Phase | ''>('')
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)

  const playableMatches = useMemo(
    () => matches.filter((m) => m.id !== 'tbd'),
    [matches]
  )

  const filteredMatches = useMemo(
    () => phase ? playableMatches.filter((m) => m.phase === phase) : playableMatches,
    [playableMatches, phase]
  )

  // Group by phase label for display
  const groupedByPhase = useMemo(() => {
    const map = new Map<Phase, Match[]>()
    for (const m of filteredMatches) {
      const list = map.get(m.phase) ?? []
      list.push(m)
      map.set(m.phase, list)
    }
    return map
  }, [filteredMatches])

  const pronoCount = pronosticos.size
  const totalMatches = playableMatches.length

  // Compute stats
  const stats = useMemo((): GlobalStats => {
    const byPhase = new Map<Phase, PhaseStats>()

    for (const phase of PHASE_ORDER) {
      byPhase.set(phase, { phase, evaluated: 0, exact: 0, correctOutcome: 0, errors: 0, points: 0 })
    }

    let totalPoints = 0
    let evaluated = 0
    let exact = 0
    let correctOutcome = 0
    let errors = 0

    for (const m of playableMatches) {
      const prono = pronosticos.get(m.id)
      const result = matchResults.get(m.id)
      if (!prono || !result) continue

      const s = scoreMatch(prono.homeScore, prono.awayScore, result.homeScore, result.awayScore)
      const ps = byPhase.get(m.phase)!

      totalPoints += s.points
      evaluated++
      ps.evaluated++
      ps.points += s.points

      if (s.exact) {
        exact++; ps.exact++
      } else if (s.correctOutcome) {
        correctOutcome++; ps.correctOutcome++
      } else {
        errors++; ps.errors++
      }
    }

    return {
      totalPoints,
      evaluated,
      exact,
      correctOutcome,
      errors,
      byPhase: PHASE_ORDER.map((p) => byPhase.get(p)!).filter((ps) => ps.evaluated > 0),
    }
  }, [playableMatches, pronosticos, matchResults])

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Pronósticos</h1>
            <p className="text-xs text-ink-3 mt-0.5">
              {pronoCount}/{totalMatches} ingresados
              {finalized && <span className="ml-2 text-gold font-semibold">· Finalizado</span>}
            </p>
          </div>
          {stats.evaluated > 0 && (
            <div className="text-right">
              <p className="text-2xl font-black text-gold">{stats.totalPoints}</p>
              <p className="text-[10px] text-ink-3 uppercase tracking-wide">puntos</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-surface-2 rounded-xl p-1 gap-1">
          {(['pronos', 'stats'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === t ? 'bg-gold text-night' : 'text-ink-3'
              }`}
            >
              {t === 'pronos' ? 'Mis Pronósticos' : 'Estadísticas'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'stats' ? (
        <div className="px-4">
          <StatsTab stats={stats} />
        </div>
      ) : (
        <>
          {/* Phase filter */}
          <div className="px-4 mb-4">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PHASE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setPhase(f.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    phase === f.value
                      ? 'bg-gold text-night'
                      : 'bg-surface-2 border border-rim text-ink-3'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Match list */}
          <div className="px-4 space-y-6">
            {PHASE_ORDER.filter((p) => groupedByPhase.has(p)).map((p) => (
              <section key={p}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-bold text-gold uppercase tracking-wider">
                    {PHASE_LABELS[p]}
                  </p>
                  <div className="flex-1 h-px bg-rim/50" />
                  <p className="text-xs text-ink-3">
                    {groupedByPhase.get(p)!.filter((m) => pronosticos.has(m.id)).length}/
                    {groupedByPhase.get(p)!.length}
                  </p>
                </div>
                <div className="space-y-2">
                  {groupedByPhase.get(p)!.map((m) => (
                    <div key={m.id}>
                      <p className="text-[10px] mb-1 px-1">
                        <span className="font-bold text-white">{formatMatchDate(m.date)}</span>
                        <span className="text-ink-3"> · {formatMatchTime(m.date)} ART</span>
                      </p>
                      <PronoCard match={m} finalized={finalized} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Finalize button */}
          {!finalized && (
            <div className="px-4 mt-6">
              <button
                onClick={() => setShowFinalizeModal(true)}
                className="w-full py-3.5 rounded-xl font-bold text-sm border-2 border-gold text-gold transition-colors active:bg-gold/10"
              >
                Finalizar Pronósticos ({pronoCount}/{totalMatches})
              </button>
            </div>
          )}

          {finalized && (
            <div className="px-4 mt-6">
              <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 text-center">
                <p className="text-sm font-semibold text-gold">Pronósticos finalizados</p>
                <p className="text-xs text-ink-3 mt-0.5">Ya no podés modificar tus predicciones</p>
              </div>
            </div>
          )}
        </>
      )}

      {showFinalizeModal && (
        <FinalizeModal
          count={pronoCount}
          total={totalMatches}
          onConfirm={async () => {
            await finalizePronosticos()
            setShowFinalizeModal(false)
          }}
          onCancel={() => setShowFinalizeModal(false)}
        />
      )}
    </div>
  )
}
