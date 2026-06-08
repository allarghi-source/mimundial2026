import { openDB, type IDBPDatabase } from 'idb'
import type { Favorite, PersonalEvent, UserPreferences, MatchResult, QualifiedThird } from '../types'

const DB_NAME = 'mimundial2026'
const DB_VERSION = 2

interface WorldCupDB {
  favorites: { key: string; value: Favorite }
  personalEvents: { key: string; value: PersonalEvent }
  preferences: { key: string; value: UserPreferences }
  matchResults: { key: string; value: MatchResult }
  qualifiedThirds: { key: string; value: QualifiedThird }
}

let db: IDBPDatabase<WorldCupDB> | null = null

async function getDB(): Promise<IDBPDatabase<WorldCupDB>> {
  if (db) return db
  db = await openDB<WorldCupDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('favorites')) {
        database.createObjectStore('favorites', { keyPath: 'matchId' })
      }
      if (!database.objectStoreNames.contains('personalEvents')) {
        database.createObjectStore('personalEvents', { keyPath: 'matchId' })
      }
      if (!database.objectStoreNames.contains('preferences')) {
        database.createObjectStore('preferences')
      }
      if (!database.objectStoreNames.contains('matchResults')) {
        database.createObjectStore('matchResults', { keyPath: 'matchId' })
      }
      if (!database.objectStoreNames.contains('qualifiedThirds')) {
        database.createObjectStore('qualifiedThirds', { keyPath: 'slot' })
      }
    },
  })
  return db
}

// ── Favorites ──────────────────────────────────────────────────────────────

export async function getFavorites(): Promise<Favorite[]> {
  return (await getDB()).getAll('favorites')
}

export async function addFavorite(matchId: string): Promise<void> {
  const database = await getDB()
  await database.put('favorites', { matchId, createdAt: new Date().toISOString() })
}

export async function removeFavorite(matchId: string): Promise<void> {
  await (await getDB()).delete('favorites', matchId)
}

// ── Personal events ────────────────────────────────────────────────────────

export async function getPersonalEvents(): Promise<PersonalEvent[]> {
  return (await getDB()).getAll('personalEvents')
}

export async function getPersonalEvent(matchId: string): Promise<PersonalEvent | undefined> {
  return (await getDB()).get('personalEvents', matchId)
}

export async function savePersonalEvent(event: PersonalEvent): Promise<void> {
  await (await getDB()).put('personalEvents', event)
}

export async function deletePersonalEvent(matchId: string): Promise<void> {
  await (await getDB()).delete('personalEvents', matchId)
}

// ── Preferences ────────────────────────────────────────────────────────────

export async function getPreferences(): Promise<UserPreferences | undefined> {
  return (await getDB()).get('preferences', 'prefs')
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await (await getDB()).put('preferences', prefs, 'prefs')
}

// ── Match results ──────────────────────────────────────────────────────────

export async function getMatchResults(): Promise<MatchResult[]> {
  return (await getDB()).getAll('matchResults')
}

export async function saveMatchResult(result: MatchResult): Promise<void> {
  await (await getDB()).put('matchResults', result)
}

export async function deleteMatchResult(matchId: string): Promise<void> {
  await (await getDB()).delete('matchResults', matchId)
}

export async function clearMatchResults(): Promise<void> {
  await (await getDB()).clear('matchResults')
}

// ── Qualified thirds ───────────────────────────────────────────────────────

export async function getQualifiedThirds(): Promise<QualifiedThird[]> {
  return (await getDB()).getAll('qualifiedThirds')
}

export async function saveQualifiedThird(qt: QualifiedThird): Promise<void> {
  await (await getDB()).put('qualifiedThirds', qt)
}

export async function deleteQualifiedThird(slot: string): Promise<void> {
  await (await getDB()).delete('qualifiedThirds', slot)
}

export async function clearQualifiedThirds(): Promise<void> {
  await (await getDB()).clear('qualifiedThirds')
}
