import { useCallback, useEffect, useState } from 'react'
import { onCacheInvalidate } from '../services/api'

/**
 * Fetch data from the API and keep it in sync.
 *
 * The data is re-fetched whenever the cache for that resource is invalidated
 * (an admin saved a change, or another tab did), so the UI always reflects
 * what is actually stored on the server.
 */
export function useApiData(fetcher, { initial = null, enabled = true } = {}) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!enabled) return null
    try {
      const res = await fetcher()
      if (res && res.success) {
        setData(res.data)
        setError(null)
      }
      return res
    } catch (e) {
      setError(e)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetcher, enabled])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => onCacheInvalidate(load), [load])

  return [data, loading, error, load]
}
