import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
  UpdateType,
} from '@powersync/web'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const POWERSYNC_URL = process.env.NEXT_PUBLIC_POWERSYNC_URL || 'http://localhost:8585'

/**
 * PowerSync backend connector for Orchestra Next.js app.
 *
 * - fetchCredentials: obtains a PowerSync JWT from the Orchestra backend
 * - uploadData: sends local CRUD operations to the Orchestra REST API
 */
export class OrchestraConnector implements PowerSyncBackendConnector {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('orchestra_token')
  }

  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const token = this.getToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_URL}/api/powersync/token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) throw new Error(`PowerSync token fetch failed: ${res.status}`)

    const data = await res.json()
    return {
      endpoint: POWERSYNC_URL,
      token: data.token,
      expiresAt: new Date(data.expires_at * 1000),
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const token = this.getToken()
    if (!token) return

    const transaction = await database.getNextCrudTransaction()
    if (!transaction) return

    try {
      for (const op of transaction.crud) {
        const { table, id, opData } = op
        const url = `${API_URL}/api/${table}`

        switch (op.op) {
          case UpdateType.PUT:
            await fetch(url, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id, ...opData }),
            })
            break

          case UpdateType.PATCH:
            await fetch(`${url}/${id}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(opData),
            })
            break

          case UpdateType.DELETE:
            await fetch(`${url}/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            })
            break
        }
      }

      await transaction.complete()
    } catch (e) {
      console.error('[PowerSync] Upload failed:', e)
      // Don't complete — will retry
    }
  }
}
