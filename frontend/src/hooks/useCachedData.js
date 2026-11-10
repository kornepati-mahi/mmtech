import { useCallback, useEffect, useState } from 'react'
import { getCachedValue, onCacheInvalidate } from '../services/api'

/**
 * Read data from the API and stay in sync with it.
 *
 * The value is re-read whenever the cached entry changes, so an admin edit
 * (in this tab or another one) repaints the UI immediately.
 *
 * @param key    cache key, e.g. 'blogs'
 * @param fetcher api helper, e.g. getBlogs
 */
export function useCachedData(key, fetcher, { initial = null } = {}) {
  const [data, setData] = useState(() => getCachedValue(key) ?? initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const value = await fetcher()
      if (value !== undefined) setData(value)
      setError(null)
      return value
    } catch (e) {
      setError(e)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    load()
  }, [load])

  useEffect(
    () =>
      onCacheInvalidate((keys, value) => {
        if (!keys.includes(key)) return
        if (value !== undefined) {
          setData(value)
          return
        }
        // The entry was dropped, so pull a fresh copy.
        load()
      }),
    [key, load]
  )

  return [data, loading, error, load]
}
