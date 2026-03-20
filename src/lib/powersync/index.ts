let db: any = null
let connected = false
let PowerSyncDatabase: any = null

async function loadPowerSync() {
  if (PowerSyncDatabase) return
  if (typeof window === 'undefined') return // SSR — skip
  const mod = await import('@powersync/web')
  PowerSyncDatabase = mod.PowerSyncDatabase
}

/**
 * Get or create the PowerSync database singleton.
 * Uses IndexedDB for local storage on web.
 */
export async function getPowerSyncDatabase() {
  await loadPowerSync()
  if (db) return db
  if (!PowerSyncDatabase) return null

  const { powersyncSchema } = await import('./schema')
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

  const database = await getPowerSyncDatabase()
  if (!database) return

  const { OrchestraConnector } = await import('./connector')
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

export { powersyncSchema } from './schema'
export { OrchestraConnector } from './connector'
