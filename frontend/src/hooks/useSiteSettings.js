import { useCallback, useEffect, useState } from 'react'
import { getSettings, onCacheInvalidate } from '../services/api'

export const DEFAULT_STATS = {
  years: '15+',
  uptime: '99.9%',
  endpoints: '2,400+',
  response: '<15m',
  clients: '250+',
  engineers: '40+',
  secured: '4,900+',
  recommend: '98%',
  rating: '4.9/5',
}

export const STAT_FIELDS = [
  { key: 'years', label: 'Years of experience', hint: 'Shown on the Home stat strip' },
  { key: 'uptime', label: 'Platform uptime', hint: 'Home stat strip + About numbers' },
  { key: 'endpoints', label: 'Endpoints managed', hint: 'Home stat strip' },
  { key: 'response', label: 'Average response', hint: 'Home stat strip' },
  { key: 'clients', label: 'Business clients', hint: 'About numbers + Reviews summary' },
  { key: 'engineers', label: 'Engineers & consultants', hint: 'About numbers' },
  { key: 'secured', label: 'Endpoints secured', hint: 'About numbers' },
  { key: 'recommend', label: 'Would recommend us', hint: 'Reviews summary' },
  { key: 'rating', label: 'Average client rating', hint: 'Reviews summary' },
]

const parseStats = value => {
  if (!value) return DEFAULT_STATS
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return { ...DEFAULT_STATS, ...parsed }
  } catch {
    return DEFAULT_STATS
  }
}

/**
 * Shared site settings + key numbers.
 * getSettings() is cached, so every consumer reuses one request.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(null)
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await getSettings()
      if (res) setSettings(res)
    } catch {
      /* keep previous value */
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Pick up admin changes (e.g. new phone number or key numbers) immediately.
  useEffect(() => onCacheInvalidate(load), [load])

  const stats = parseStats(settings?.site_stats)
  const phone = settings?.phone || '+44 0000 000000'
  const email = settings?.contact_email || 'info@mmittech.com'
  const address = settings?.address || 'London, United Kingdom'
  const whatsappNumber = settings?.whatsapp_number || phone.replace(/\D/g, '')
  const companyName = settings?.company_name || 'MM IT Tech Ltd'

  return { settings, stats, phone, email, address, whatsappNumber, companyName, ready }
}
