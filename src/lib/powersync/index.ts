let db: any = null
let connected = false

/**
 * Get or create the PowerSync database singleton.
 * Uses dynamic import to avoid SSR/WASM build issues.
 */
export async function getPowerSyncDatabase() {
  if (db) return db
  if (typeof window === 'undefined') return null

  try {
    const { PowerSyncDatabase } = await import('@powersync/web')
    const { getPowerSyncSchema } = await import('./schema')
    const schema = await getPowerSyncSchema()
    if (!schema) return null

    db = new PowerSyncDatabase({
      schema,
      database: { dbFilename: 'orchestra-sync.db' },
    })
    return db
  } catch (e) {
    console.warn('[PowerSync] Init failed:', e)
    return null
  }
}

/**
 * Connect to PowerSync with the current user's credentials.
 */
export async function connectPowerSync(): Promise<void> {
  if (connected) return

  const database = await getPowerSyncDatabase()
  if (!database) return

  try {
    const { OrchestraConnector } = await import('./connector')
    const connector = new OrchestraConnector()
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
