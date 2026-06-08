import { useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useData } from '../hooks/useData'
import { useAppStore } from '../store/appStore'
import PageHeader from '../components/PageHeader'
import FavoriteButton from '../components/FavoriteButton'
import EmptyState from '../components/EmptyState'
import TeamFlag from '../components/TeamFlag'
import { PHASE_LABELS } from '../types'
import { formatMatchDateTime } from '../utils/dates'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const { matches, getTeam, getVenue } = useData()

  const match = useMemo(() => matches.find((m) => m.id === id), [matches, id])

  const isFavorite = useAppStore((s) => s.isFavorite(id ?? ''))
  const getPersonalEvent = useAppStore((s) => s.getPersonalEvent)
  const toggleWantToWatch = useAppStore((s) => s.toggleWantToWatch)
  const toggleWatched = useAppStore((s) => s.toggleWatched)
  const saveNote = useAppStore((s) => s.saveNote)
  const saveUserScore = useAppStore((s) => s.saveUserScore)

  const ev = id ? getPersonalEvent(id) : undefined

  const [note, setNote] = useState(ev?.note ?? '')
  const [editingNote, setEditingNote] = useState(false)
  const [homeScore, setHomeScore] = useState(String(ev?.userHomeScore ?? ''))
  const [awayScore, setAwayScore] = useState(String(ev?.userAwayScore ?? ''))
  const [editingScore, setEditingScore] = useState(false)

  if (!match || !id) {
    return (
      <div>
        <PageHeader title="Partido" back />
        <EmptyState icon="❌" title="Partido no encontrado" />
      </div>
    )
  }

  const home = getTeam(match.homeTeamId)
  const away = getTeam(match.awayTeamId)
  const venue = getVenue(match.venueId)
  const isTbd = match.homeTeamId === 'tbd' || match.awayTeamId === 'tbd'

  async function handleSaveNote() {
    await saveNote(id!, note)
    setEditingNote(false)
  }

  async function handleSaveScore() {
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (!isNaN(h) && !isNaN(a)) {
      await saveUserScore(id!, h, a)
    }
    setEditingScore(false)
  }

  return (
    <div>
      <PageHeader
        title={isTbd ? PHASE_LABELS[match.phase] : `${home?.code} vs ${away?.code}`}
        back
        right={<FavoriteButton matchId={id} active={isFavorite} />}
      />

      <div className="px-4 pt-6 pb-4 space-y-5">
        <div className="bg-surface-2 border border-rim rounded-2xl p-6">
          <div className="flex items-center justify-around mb-4">
            <div className="flex flex-col items-center gap-2">
              <TeamFlag countryCode={home?.countryCode} size={64} />
              <span className="text-sm font-bold text-ink">{home?.name ?? 'Por Definir'}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              {match.status === 'finished' ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-gold">{match.homeScore}</span>
                  <span className="text-2xl text-ink-3">–</span>
                  <span className="text-4xl font-bold text-gold">{match.awayScore}</span>
                </div>
              ) : match.status === 'live' ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 font-bold">EN VIVO</span>
                </div>
              ) : (
                <span className="text-ink-3 text-sm font-medium">vs</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <TeamFlag countryCode={away?.countryCode} size={64} />
              <span className="text-sm font-bold text-ink">{away?.name ?? 'Por Definir'}</span>
            </div>
          </div>

          <div className="border-t border-rim pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gold">📅</span>
              <span className="text-ink-2">{formatMatchDateTime(match.date)} ART</span>
            </div>
            {venue && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gold">🏟</span>
                  <span className="text-ink-2">{venue.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gold">📍</span>
                  <span className="text-ink-2">{venue.city}, {venue.country}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gold">🏆</span>
              <span className="text-ink-2">
                {match.phase === 'group'
                  ? `Grupo ${match.group} · Fecha ${match.matchDay}`
                  : PHASE_LABELS[match.phase]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => void toggleWantToWatch(id)}
            className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
              ev?.wantToWatch
                ? 'bg-gold/20 border-gold text-gold'
                : 'bg-surface-2 border-rim text-ink-2'
            }`}
          >
            {ev?.wantToWatch ? '📺 Quiero verlo ✓' : '📺 Quiero verlo'}
          </button>
          <button
            onClick={() => void toggleWatched(id)}
            className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
              ev?.watched
                ? 'bg-green-900/40 border-green-500 text-green-400'
                : 'bg-surface-2 border-rim text-ink-2'
            }`}
          >
            {ev?.watched ? '✅ Visto ✓' : '👁 Marcar visto'}
          </button>
        </div>

        <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-rim">
            <p className="text-sm font-semibold text-ink">Mi resultado</p>
            <button
              onClick={() => setEditingScore(!editingScore)}
              className="text-xs text-gold"
            >
              {editingScore ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          <div className="p-4">
            {editingScore ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-16 bg-surface-3 border border-rim rounded-lg text-center text-xl font-bold text-gold py-2 outline-none focus:border-gold"
                />
                <span className="text-ink-3 text-xl">–</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-16 bg-surface-3 border border-rim rounded-lg text-center text-xl font-bold text-gold py-2 outline-none focus:border-gold"
                />
                <button
                  onClick={() => void handleSaveScore()}
                  className="flex-1 py-2 bg-gold text-night rounded-lg text-sm font-bold"
                >
                  Guardar
                </button>
              </div>
            ) : ev?.userHomeScore !== undefined ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gold">{ev.userHomeScore}</span>
                <span className="text-ink-3">–</span>
                <span className="text-2xl font-bold text-gold">{ev.userAwayScore}</span>
                <span className="text-xs text-ink-3 ml-2">tu predicción</span>
              </div>
            ) : (
              <p className="text-sm text-ink-3">Cargá tu predicción</p>
            )}
          </div>
        </div>

        <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-rim">
            <p className="text-sm font-semibold text-ink">📝 Nota</p>
            <button
              onClick={() => {
                if (editingNote) { void handleSaveNote() } else { setEditingNote(true) }
              }}
              className="text-xs text-gold"
            >
              {editingNote ? 'Guardar' : 'Editar'}
            </button>
          </div>
          <div className="p-4">
            {editingNote ? (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribí una nota sobre este partido..."
                rows={3}
                className="w-full bg-surface-3 border border-rim rounded-lg p-3 text-sm text-ink placeholder:text-ink-3 outline-none focus:border-gold resize-none"
              />
            ) : (
              <p className="text-sm text-ink-2 min-h-[2rem]">
                {ev?.note || <span className="text-ink-3">Sin nota</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
