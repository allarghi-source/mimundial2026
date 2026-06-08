import { create } from 'zustand'
import type { Favorite, PersonalEvent, UserPreferences, MatchResult, QualifiedThird } from '../types'
import * as storage from '../services/storage'

interface AppState {
  favorites: Set<string>
  personalEvents: Map<string, PersonalEvent>
  preferences: UserPreferences
  matchResults: Map<string, MatchResult>
  qualifiedThirds: Map<string, QualifiedThird>
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
}

const DEFAULT_PREFS: UserPreferences = {
  theme: 'dark',
  favoriteTeams: [],
  notifications: false,
}

export const useAppStore = create<AppState>((set, get) => ({
  favorites: new Set(),
  personalEvents: new Map(),
  preferences: DEFAULT_PREFS,
  matchResults: new Map(),
  qualifiedThirds: new Map(),
  initialized: false,

  async init() {
    if (get().initialized) return
    const [favs, events, prefs, results, thirds] = await Promise.all([
      storage.getFavorites(),
      storage.getPersonalEvents(),
      storage.getPreferences(),
      storage.getMatchResults(),
      storage.getQualifiedThirds(),
    ])
    set({
      favorites: new Set(favs.map((f: Favorite) => f.matchId)),
      personalEvents: new Map(events.map((e: PersonalEvent) => [e.matchId, e])),
      preferences: prefs ?? DEFAULT_PREFS,
      matchResults: new Map(results.map((r: MatchResult) => [r.matchId, r])),
      qualifiedThirds: new Map(thirds.map((qt: QualifiedThird) => [qt.slot, qt])),
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
}))
