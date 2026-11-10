import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/backend/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* ------------------------------------------------------------------ *
 * Client-side response cache
 *
 * Goals:
 *  - navigating between pages must not re-fetch data we already have,
 *  - an admin change must still appear straight away, in every tab.
 *
 * How it works:
 *  1. Public endpoints are cached in memory with the value they resolved to.
 *  2. A stale entry is served immediately while a fresh copy is fetched in
 *     the background (stale-while-revalidate).
 *  3. The API sends ETags, so background revalidation is a cheap 304.
 *  4. Whenever a cached value changes, subscribers are notified so the UI
 *     repaints with the new data.
 *  5. Admin saves broadcast to other tabs, which revalidate and repaint too.
 * ------------------------------------------------------------------ */
const FRESH_TTL = 20_000 // considered fresh for 20s
const STALE_MAX_AGE = 30 * 60_000 // keep serving stale data for 30 min
const CHANNEL = 'mmit-site-data'

const cache = new Map() // key -> { at, promise, value }
const loaders = new Map() // key -> loader fn
const listeners = new Set() // subscribers to cache changes

/* ---------------- cross-tab invalidation ---------------- */
let channel = null
if (typeof BroadcastChannel !== 'undefined') {
  try {
    channel = new BroadcastChannel(CHANNEL)
    channel.onmessage = event => {
      const key = event?.data?.key
      if (!key) return
      cache.delete(key)
      revalidate(key)
    }
  } catch {
    channel = null
  }
}

/* ---------------- notifications ---------------- */
function notify(key) {
  const value = cache.get(key)?.value
  listeners.forEach(fn => {
    try {
      fn([key], value)
    } catch {
      /* ignore listener errors */
    }
  })
}

/** Subscribe to cache changes. Returns an unsubscribe function. */
export const onCacheInvalidate = fn => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Read the currently cached value for a key (undefined if not cached). */
export const getCachedValue = key => cache.get(key)?.value

/* ---------------- core ---------------- */
function fetchInto(key, loader) {
  const promise = loader()
    .then(result => {
      cache.set(key, { at: Date.now(), promise: Promise.resolve(result), value: result })
      return result
    })
    .catch(error => {
      const stale = cache.get(key)
      if (stale) return stale.promise
      cache.delete(key)
      throw error
    })
  cache.set(key, { at: Date.now(), promise, value: cache.get(key)?.value })
  return promise
}

/** Background revalidation; notifies subscribers when the value changes. */
function revalidate(key) {
  const loader = loaders.get(key)
  if (!loader) return
  fetchInto(key, loader)
    .then(() => notify(key))
    .catch(() => {})
}

function swr(key, loader) {
  loaders.set(key, loader)
  const entry = cache.get(key)
  const now = Date.now()

  if (entry) {
    const age = now - entry.at
    if (age < FRESH_TTL) return entry.promise
    if (age < STALE_MAX_AGE) {
      revalidate(key) // refresh in the background
      return entry.promise
    }
  }
  return fetchInto(key, loader)
}

/**
 * Drop cached responses so the next read hits the API.
 * Other tabs are told to do the same, so admin changes show everywhere.
 */
export const invalidateCache = (...keys) => {
  const list = keys.length ? keys : Array.from(cache.keys())
  list.forEach(key => {
    cache.delete(key)
    notify(key)
  })
  try {
    list.forEach(key => channel?.postMessage({ key }))
  } catch {
    /* ignore */
  }
}

/* Revalidate when the user comes back to this tab. */
if (typeof window !== 'undefined') {
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return
    Array.from(loaders.keys()).forEach(key => revalidate(key))
  }
  window.addEventListener('focus', onVisible)
  document.addEventListener('visibilitychange', onVisible)
}

/* ---------------- Public endpoints ---------------- */
/* These return the unwrapped payload (array or object), not the envelope. */
export const getSettings = () =>
  swr('settings', () => api.get('/settings/get.php').then(r => r.data?.data ?? null))
export const getServices = () =>
  swr('services', () => api.get('/services/list.php').then(r => r.data?.data ?? []))
export const getBlogs = () => swr('blogs', () => api.get('/blogs/list.php').then(r => r.data?.data ?? []))
export const getTestimonials = () =>
  swr('testimonials', () => api.get('/testimonials/list.php').then(r => r.data?.data ?? []))
export const submitContact = payload => api.post('/contact/submit.php', payload).then(r => r.data)

/* ---------------- Admin: auth ---------------- */
export const adminLogin = payload => api.post('/auth/login.php', payload).then(r => r.data)
export const adminMe = () => api.get('/auth/me.php').then(r => r.data)
export const adminLogout = () => api.post('/auth/logout.php').then(r => r.data)
export const adminChangePassword = payload => api.post('/auth/change-password.php', payload).then(r => r.data)

/* ---------------- Admin: enquiries ---------------- */
export const adminListEnquiries = () => api.get('/contact/list.php').then(r => r.data)
export const adminUpdateEnquiryStatus = payload =>
  api.post('/contact/update-status.php', payload).then(r => r.data)

/* ---------------- Admin: blog posts ---------------- */
export const adminListPosts = () => api.get('/blogs/admin-list.php').then(r => r.data)
export const adminCreatePost = payload => api.post('/blogs/create.php', payload).then(r => r.data)
export const adminUpdatePost = payload => api.post('/blogs/update.php', payload).then(r => r.data)
export const adminDeletePost = payload => api.post('/blogs/delete.php', payload).then(r => r.data)

export const adminUploadImage = (file, onProgress) => {
  const form = new FormData()
  form.append('image', file)
  return api
    .post('/blogs/upload-image.php', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    })
    .then(r => r.data)
}

/* ---------------- Admin: services ---------------- */
export const adminListServices = () => api.get('/services/admin-list.php').then(r => r.data)
export const adminCreateService = payload => api.post('/services/create.php', payload).then(r => r.data)
export const adminUpdateService = payload => api.post('/services/update.php', payload).then(r => r.data)
export const adminDeleteService = payload => api.post('/services/delete.php', payload).then(r => r.data)

/* ---------------- Admin: testimonials ---------------- */
export const adminListTestimonials = () => api.get('/testimonials/admin-list.php').then(r => r.data)
export const adminCreateTestimonial = payload =>
  api.post('/testimonials/create.php', payload).then(r => r.data)
export const adminUpdateTestimonial = payload =>
  api.post('/testimonials/update.php', payload).then(r => r.data)
export const adminDeleteTestimonial = payload =>
  api.post('/testimonials/delete.php', payload).then(r => r.data)

/* ---------------- Admin: settings ---------------- */
export const adminUpdateSettings = payload => api.post('/settings/update.php', payload).then(r => r.data)

/* ---------------- Image URLs ---------------- */
const UPLOAD_BASE = (import.meta.env.VITE_UPLOAD_BASE || '/uploads').replace(/\/+$/, '')

/**
 * Resolve a stored image reference to a usable URL.
 * Accepts a bare filename, an "/uploads/..." path or an absolute URL.
 */
export const uploadUrl = value => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw
  const name = raw.replace(/^\/+/, '').replace(/^uploads\//, '')
  return `${UPLOAD_BASE}/${name}`
}

export default api
