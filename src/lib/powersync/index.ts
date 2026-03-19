import { PowerSyncDatabase } from '@powersync/web'
import { powersyncSchema } from './schema'
import { OrchestraConnector } from './connector'

let db: PowerSyncDatabase | null = null
let connected = false

/**
 * Get or create the PowerSync database singleton.
 * Uses IndexedDB for local storage on web.
 */
export function getPowerSyncDatabase(): PowerSyncDatabase {
  if (db) return db

  db = new PowerSyncDatabase({
    schema: powersyncSchema,
    database: { dbFilename: 'orchestra-sync.db' },
  })

  return db
}

/**
 * Connect to PowerSync with the current user's credentials.
 * Call this after login.
 */
export async function connectPowerSync(): Promise<void> {
  if (connected) return

  const database = getPowerSyncDatabase()
  const connector = new OrchestraConnector()

  try {
    await database.connect(connector)
    connected = true
    console.log('[PowerSync] Connected')
  } catch (e) {
    console.error('[PowerSync] Connection failed:', e)
  }
}

/**
 * Disconnect from PowerSync. Call on logout.
 */
export async function disconnectPowerSync(): Promise<void> {
  if (!db || !connected) return

  await db.disconnect()
  connected = false
  console.log('[PowerSync] Disconnected')
}

/**
 * Watch a SQL query reactively. Returns an async iterable.
 *
 * Usage:
 * ```ts
 * const db = getPowerSyncDatabase()
 * for await (const results of db.watch('SELECT * FROM notes')) {
 *   setNotes(results.rows._array)
 * }
 * ```
 */
export { powersyncSchema } from './schema'
export { OrchestraConnector } from './connector'
