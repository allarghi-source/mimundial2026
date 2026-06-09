import { create } from 'zustand'
import type { Favorite, PersonalEvent, UserPreferences, MatchResult, QualifiedThird, Pronostico } from '../types'
import * as storage from '../services/storage'

interface AppState {
  favorites: Set<string>
  personalEvents: Map<string, PersonalEvent>
  preferences: UserPreferences
  matchResults: Map<string, MatchResult>
  qualifiedThirds: Map<string, QualifiedThird>
  pronosticos: Map<string, Pronostico>
  initialized: boolean

  init: () => Promise<void>

  // Favorites
  toggleFavorite: (matchId: string) => Promise<void>
  isFavorite: (matchId: string) => boolean

  // Personal events
  getPersonalEvent: (matchId: string) => PersonalEvent | undefined
  toggleWantToWatch: (matchId: string) => Promise<void>
  toggleWatched: (matchId: string) => Promise<void>
  saveNote: (matchId: string, note: string) => Promise<void>
  saveUserScore: (matchId: string, home: number, away: number) => Promise<void>

  // Preferences
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>

  // Match results
  saveResult: (matchId: string, homeScore: number, awayScore: number) => Promise<void>
  deleteResult: (matchId: string) => Promise<void>
  clearAllResults: () => Promise<void>

  // Qualified thirds
  saveQualifiedThird: (slot: string, teamId: string) => Promise<void>
  removeQualifiedThird: (slot: string) => Promise<void>
  clearQualifiedThirds: () => Promise<void>

  // Pronósticos
  savePronostico: (matchId: string, homeScore: number, awayScore: number) => Promise<void>
  deletePronostico: (matchId: string) => Promise<void>
  clearPronosticos: () => Promise<void>
  finalizePronosticos: () => Promise<void>
}

const DEFAULT_PREFS: UserPreferences = {
  theme: 'dark',
  favoriteTeams: [],
  notifications: false,
  pronosticosFinalized: false,
}

export const useAppStore = create<AppState>((set, get) => ({
  favorites: new Set(),
  personalEvents: new Map(),
  preferences: DEFAULT_PREFS,
  matchResults: new Map(),
  qualifiedThirds: new Map(),
  pronosticos: new Map(),
  initialized: false,

  async init() {
    if (get().initialized) return
    const [favs, events, prefs, results, thirds, pronos] = await Promise.all([
      storage.getFavorites(),
      storage.getPersonalEvents(),
      storage.getPreferences(),
      storage.getMatchResults(),
      storage.getQualifiedThirds(),
      storage.getPronosticos(),
    ])
    set({
      favorites: new Set(favs.map((f: Favorite) => f.matchId)),
      personalEvents: new Map(events.map((e: PersonalEvent) => [e.matchId, e])),
      // Merge with defaults to handle existing stored prefs missing new fields
      preferences: { ...DEFAULT_PREFS, ...(prefs ?? {}) },
      matchResults: new Map(results.map((r: MatchResult) => [r.matchId, r])),
      qualifiedThirds: new Map(thirds.map((qt: QualifiedThird) => [qt.slot, qt])),
      pronosticos: new Map(pronos.map((p: Pronostico) => [p.matchId, p])),
      initialized: true,
    })
  },

  async toggleFavorite(matchId) {
    const { favorites } = get()
    const next = new Set(favorites)
    if (next.has(matchId)) {
      next.delete(matchId)
      await storage.removeFavorite(matchId)
    } else {
      next.add(matchId)
      await storage.addFavorite(matchId)
    }
    set({ favorites: next })
  },

  isFavorite(matchId) {
    return get().favorites.has(matchId)
  },

  getPersonalEvent(matchId) {
    return get().personalEvents.get(matchId)
  },

  async toggleWantToWatch(matchId) {
    const current = get().personalEvents.get(matchId) ?? { matchId, wantToWatch: false, watched: false }
    const updated = { ...current, wantToWatch: !current.wantToWatch }
    await storage.savePersonalEvent(updated)
    const next = new Map(get().personalEvents)
    next.set(matchId, updated)
    set({ personalEvents: next })
  },

  async toggleWatched(matchId) {
    const current = get().personalEvents.get(matchId) ?? { matchId, wantToWatch: false, watched: false }
    const updated = { ...current, watched: !current.watched }
    await storage.savePersonalEvent(updated)
    const next = new Map(get().personalEvents)
    next.set(matchId, updated)
    set({ personalEvents: next })
  },

  async saveNote(matchId, note) {
    const current = get().personalEvents.get(matchId) ?? { matchId, wantToWatch: false, watched: false }
    const updated = { ...current, note }
    await storage.savePersonalEvent(updated)
    const next = new Map(get().personalEvents)
    next.set(matchId, updated)
    set({ personalEvents: next })
  },

  async saveUserScore(matchId, userHomeScore, userAwayScore) {
    const current = get().personalEvents.get(matchId) ?? { matchId, wantToWatch: false, watched: false }
    const updated = { ...current, userHomeScore, userAwayScore }
    await storage.savePersonalEvent(updated)
    const next = new Map(get().personalEvents)
    next.set(matchId, updated)
    set({ personalEvents: next })
  },

  async updatePreferences(patch) {
    const updated = { ...get().preferences, ...patch }
    await storage.savePreferences(updated)
    set({ preferences: updated })
  },

  async saveResult(matchId, homeScore, awayScore) {
    const result: MatchResult = { matchId, homeScore, awayScore }
    await storage.saveMatchResult(result)
    const next = new Map(get().matchResults)
    next.set(matchId, result)
    set({ matchResults: next })
  },

  async deleteResult(matchId) {
    await storage.deleteMatchResult(matchId)
    const next = new Map(get().matchResults)
    next.delete(matchId)
    set({ matchResults: next })
  },

  async clearAllResults() {
    await storage.clearMatchResults()
    set({ matchResults: new Map() })
  },

  async saveQualifiedThird(slot, teamId) {
    const qt: QualifiedThird = { slot, teamId }
    await storage.saveQualifiedThird(qt)
    const next = new Map(get().qualifiedThirds)
    next.set(slot, qt)
    set({ qualifiedThirds: next })
  },

  async removeQualifiedThird(slot) {
    await storage.deleteQualifiedThird(slot)
    const next = new Map(get().qualifiedThirds)
    next.delete(slot)
    set({ qualifiedThirds: next })
  },

  async clearQualifiedThirds() {
    await storage.clearQualifiedThirds()
    set({ qualifiedThirds: new Map() })
  },

  async savePronostico(matchId, homeScore, awayScore) {
    const p: Pronostico = { matchId, homeScore, awayScore }
    await storage.savePronostico(p)
    const next = new Map(get().pronosticos)
    next.set(matchId, p)
    set({ pronosticos: next })
  },

  async deletePronostico(matchId) {
    await storage.deletePronostico(matchId)
    const next = new Map(get().pronosticos)
    next.delete(matchId)
    set({ pronosticos: next })
  },

  async clearPronosticos() {
    await storage.clearPronosticos()
    set({ pronosticos: new Map() })
  },

  async finalizePronosticos() {
    const updated = { ...get().preferences, pronosticosFinalized: true }
    await storage.savePreferences(updated)
    set({ preferences: updated })
  },
}))
