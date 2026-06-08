import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { useBracket } from '../hooks/useStandings'
import { useData } from '../hooks/useData'
import { formatMatchDate, formatMatchTime } from '../utils/dates'
import type { Match } from '../types'
import { PHASE_LABELS } from '../types'
import TeamFlag from './TeamFlag'

interface Props {
  match: Match
  onClose: () => void
}

export default function ResultModal({ match, onClose }: Props) {
  const { getTeam } = useData()
  const { resolveTeam } = useBracket()
  const matchResults = useAppStore((s) => s.matchResults)
  const saveResult = useAppStore((s) => s.saveResult)
  const deleteResult = useAppStore((s) => s.deleteResult)

  const existing = matchResults.get(match.id)

  const [home, setHome] = useState(existing ? String(existing.homeScore) : '')
  const [away, setAway] = useState(existing ? String(existing.awayScore) : '')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Sync when result changes externally
  useEffect(() => {
    const r = matchResults.get(match.id)
    setHome(r ? String(r.homeScore) : '')
    setAway(r ? String(r.awayScore) : '')
  }, [match.id, matchResults])

  const homeTeam = match.homeSlot ? resolveTeam(match.homeSlot) : getTeam(match.homeTeamId)
  const awayTeam = match.awaySlot ? resolveTeam(match.awaySlot) : getTeam(match.awayTeamId)

  const homeLabel = homeTeam ? homeTeam.code : (match.homeSlot ?? 'LOCAL')
  const awayLabel = awayTeam ? awayTeam.code : (match.awaySlot ?? 'VISIT')

  const phaseLabel = match.phase === 'group'
    ? `Grupo ${match.group} · Fecha ${match.matchDay}`
    : PHASE_LABELS[match.phase]

  async function handleSave() {
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return
    setSaving(true)
    await saveResult(match.id, h, a)
    setSaving(false)
    onClose()
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setSaving(true)
    await deleteResult(match.id)
    setSaving(false)
    setConfirming(false)
    onClose()
  }

  const canSave = home !== '' && away !== '' && !isNaN(parseInt(home)) && !isNaN(parseInt(away))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-surface-1 border border-rim rounded-t-2xl px-5 pt-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-rim rounded-full" />

        {/* Header */}
        <p className="text-xs text-ink-3 uppercase tracking-wider mb-4 mt-2">{phaseLabel}</p>

        {/* Teams & score display */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex flex-col items-center gap-1">
            <TeamFlag countryCode={homeTeam?.countryCode} size={48} />
            <span className="text-sm font-bold text-ink">{homeLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="99"
              inputMode="numeric"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              placeholder="–"
              className="w-16 h-14 bg-surface-3 border border-rim rounded-xl text-center text-2xl font-bold text-gold outline-none focus:border-gold"
            />
            <span className="text-ink-3 text-xl font-light">–</span>
            <input
              type="number"
              min="0"
              max="99"
              inputMode="numeric"
              value={away}
              onChange={(e) => setAway(e.target.value)}
              placeholder="–"
              className="w-16 h-14 bg-surface-3 border border-rim rounded-xl text-center text-2xl font-bold text-gold outline-none focus:border-gold"
            />
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <TeamFlag countryCode={awayTeam?.countryCode} size={48} />
            <span className="text-sm font-bold text-ink">{awayLabel}</span>
          </div>
        </div>

        {/* Date/time info */}
        <p className="text-xs text-ink-3 text-center mb-5">
          {formatMatchDate(match.date)} · {formatMatchTime(match.date)} ART
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => void handleSave()}
            disabled={!canSave || saving}
            className="w-full py-3 rounded-xl font-bold text-night bg-gold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? 'Guardando...' : existing ? 'Actualizar resultado' : 'Guardar resultado'}
          </button>

          {existing && (
            <button
              onClick={() => void handleDelete()}
              disabled={saving}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors border ${
                confirming
                  ? 'bg-red-900/40 border-red-500 text-red-400'
                  : 'bg-surface-2 border-rim text-ink-3'
              }`}
            >
              {confirming ? 'Confirmá para borrar' : 'Borrar resultado'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-ink-3"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
