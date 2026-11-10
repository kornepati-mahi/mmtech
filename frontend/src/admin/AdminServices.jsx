import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  Search,
} from 'lucide-react'
import {
  adminListServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
  adminUploadImage,
  uploadUrl,
  invalidateCache,
} from '../services/api'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/ui/Reveal'

const BLANK = {
  id: null,
  name: '',
  slug: '',
  description: '',
  features: '',
  benefits: '',
  image: '',
  display_order: 0,
  is_enabled: 1,
}

const ICONS = [Layers, ImageIcon]

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    try {
      const res = await adminListServices()
      setServices(res.data || [])
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not load services. Your session may have expired.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return services
    return services.filter(s =>
      [s.name, s.description, s.slug].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [services, query])

  const onPickImage = async e => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Please choose an image file.' })
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'The image must be smaller than 5 MB.' })
      e.target.value = ''
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setMsg({ type: '', text: '' })
    try {
      const res = await adminUploadImage(file, e => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      })
      if (res.success) {
        setEditor(prev => ({ ...prev, image: res.filename }))
        setMsg({ type: 'success', text: 'Image uploaded. Save the service to keep it.' })
      } else {
        setMsg({ type: 'error', text: res.message || 'Upload failed.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Upload failed.' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const save = async e => {
    e.preventDefault()
    if (!editor) return
    if (!editor.name.trim()) {
      setMsg({ type: 'error', text: 'Please give the service a name.' })
      return
    }

    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const payload = {
        id: editor.id ?? undefined,
        name: editor.name,
        slug: editor.slug || editor.name,
        description: editor.description,
        features: editor.features,
        benefits: editor.benefits,
        image: editor.image,
        display_order: Number(editor.display_order) || 0,
        is_enabled: editor.is_enabled ? 1 : 0,
      }
      const res = editor.id ? await adminUpdateService(payload) : await adminCreateService(payload)
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Saved' })
        setEditor(null)
        invalidateCache('services')
        load()
      } else {
        setMsg({ type: 'error', text: res.message || 'Save failed.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async service => {
    const next = service.is_enabled ? 0 : 1
    try {
      const res = await adminUpdateService({
        id: service.id,
        name: service.name,
        description: service.description,
        features: service.features,
        benefits: service.benefits,
        image: service.image,
        display_order: service.display_order,
        is_enabled: next,
      })
      if (res.success) {
        setServices(list => list.map(s => (s.id === service.id ? { ...s, is_enabled: next } : s)))
        invalidateCache('services')
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not update the service.' })
    }
  }

  const remove = async service => {
    setSaving(true)
    try {
      const res = await adminDeleteService({ id: service.id })
      if (res.success) {
        setServices(list => list.filter(s => s.id !== service.id))
        setMsg({ type: 'success', text: res.message || 'Service deleted' })
        setConfirmDelete(null)
        invalidateCache('services')
      } else {
        setMsg({ type: 'error', text: res.message || 'Delete failed.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Delete failed.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow mb-4">
            <Layers size={13} />
            Catalog
          </span>
          <h1 className="display-2">Services</h1>
          <p className="body-md mt-2">
            {loading ? 'Loading services…' : `${filtered.length} of ${services.length} shown`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              className="field w-full pl-11 sm:w-60"
              placeholder="Search services…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditor({ ...BLANK, display_order: services.length + 1 })
              setMsg({ type: '', text: '' })
            }}
            className="btn-primary btn-md shrink-0"
          >
            <Plus size={16} />
            New service
          </button>
        </div>
      </div>

      {msg.text && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-[14px] font-medium ${
            msg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          {msg.text}
          <button onClick={() => setMsg({ type: '', text: '' })} className="ml-auto opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Editor */}
      {editor && (
        <Reveal className="mb-8">
          <form onSubmit={save} className="surface-solid overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50 px-6 py-4">
              <h2 className="font-display text-[17px] font-bold text-ink-900">
                {editor.id ? 'Edit service' : 'New service'}
              </h2>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-colors hover:text-ink-900"
                aria-label="Close editor"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-5">
                <div>
                  <label className="label" htmlFor="svc-name">
                    Name *
                  </label>
                  <input
                    id="svc-name"
                    className="field"
                    value={editor.name}
                    onChange={e => setEditor({ ...editor, name: e.target.value })}
                    placeholder="Managed IT Support"
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="svc-desc">
                    Description
                  </label>
                  <textarea
                    id="svc-desc"
                    className="field resize-y"
                    rows={3}
                    value={editor.description}
                    onChange={e => setEditor({ ...editor, description: e.target.value })}
                    placeholder="Short summary shown on the service card and detail page."
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="svc-features">
                      Features
                    </label>
                    <textarea
                      id="svc-features"
                      className="field resize-y"
                      rows={4}
                      value={editor.features}
                      onChange={e => setEditor({ ...editor, features: e.target.value })}
                      placeholder={'24/7 monitoring\nHelpdesk\nPatch management'}
                    />
                    <p className="mt-2 text-[12px] text-ink-400">One per line, or comma separated.</p>
                  </div>

                  <div>
                    <label className="label" htmlFor="svc-benefits">
                      Benefits
                    </label>
                    <textarea
                      id="svc-benefits"
                      className="field resize-y"
                      rows={4}
                      value={editor.benefits}
                      onChange={e => setEditor({ ...editor, benefits: e.target.value })}
                      placeholder={'Reduced downtime\nImproved productivity'}
                    />
                    <p className="mt-2 text-[12px] text-ink-400">One per line, or comma separated.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">Image</label>
                  <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
                    {editor.image ? (
                      <div className="relative">
                        <img src={uploadUrl(editor.image)} alt="" className="h-36 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditor({ ...editor, image: '' })}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-ink-900/70 text-white backdrop-blur transition-colors hover:bg-red-600"
                          aria-label="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid h-36 place-items-center text-ink-300">
                        <ImageIcon size={26} />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={onPickImage}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-ghost btn-sm mt-3 w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Uploading {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        {editor.image ? 'Replace image' : 'Upload image'}
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="label" htmlFor="svc-order">
                    Display order
                  </label>
                  <input
                    id="svc-order"
                    className="field"
                    type="number"
                    min={0}
                    value={editor.display_order}
                    onChange={e => setEditor({ ...editor, display_order: e.target.value })}
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-ink-200 bg-white px-4 py-3">
                  <span>
                    <span className="block text-[14px] font-semibold text-ink-800">Visible on site</span>
                    <span className="block text-[12px] text-ink-400">Turn off to hide it temporarily</span>
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-brand-600"
                    checked={Boolean(editor.is_enabled)}
                    onChange={e => setEditor({ ...editor, is_enabled: e.target.checked ? 1 : 0 })}
                  />
                </label>

                <button type="submit" disabled={saving} className="btn-primary btn-md w-full">
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editor.id ? 'Save changes' : 'Create service'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Reveal>
      )}

      {/* List */}
      {loading ? (
        <div className="surface-solid grid place-items-center px-6 py-20">
          <Loader2 size={26} className="animate-spin text-brand-600" />
          <span className="mt-3 text-sm text-ink-400">Loading services…</span>
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title={services.length ? 'No matching services' : 'No services yet'}
          text={
            services.length
              ? 'Try a different search term.'
              : 'Add your first service to publish it on the Services page.'
          }
          action={
            <button onClick={() => setEditor({ ...BLANK, display_order: services.length + 1 })} className="btn-primary btn-md">
              <Plus size={16} />
              New service
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((service, i) => (
            <Reveal key={service.id} delay={Math.min(i * 0.04, 0.25)}>
              <article
                className={`surface-solid flex flex-col gap-4 p-5 transition-all duration-500 hover:shadow-md sm:flex-row sm:items-center ${
                  service.is_enabled ? '' : 'opacity-60'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="hidden shrink-0 text-ink-300 sm:block">
                    <GripVertical size={16} />
                  </span>

                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 to-brand-700 text-white">
                    {service.image ? (
                      <img src={uploadUrl(service.image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Layers size={22} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="truncate font-display text-[16px] font-bold text-ink-900">{service.name}</h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                          service.is_enabled
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-ink-200 bg-ink-100 text-ink-500'
                        }`}
                      >
                        {service.is_enabled ? 'Live' : 'Hidden'}
                      </span>
                      <span className="rounded-full bg-ink-50 px-2.5 py-0.5 font-mono text-[11px] text-ink-500">
                        #{service.display_order}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[13px] text-ink-500">
                      {service.description || 'No description.'}
                    </p>
                    {service.slug && (
                      <p className="mt-0.5 truncate font-mono text-[11px] text-ink-400">/{service.slug}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggleEnabled(service)}
                    className="btn-ghost btn-sm"
                    title={service.is_enabled ? 'Hide from the website' : 'Show on the website'}
                  >
                    {service.is_enabled ? <EyeOff size={13} /> : <Eye size={13} />}
                    {service.is_enabled ? 'Hide' : 'Show'}
                  </button>

                  <button
                    onClick={() => {
                      setEditor({ ...BLANK, ...service })
                      setMsg({ type: '', text: '' })
                    }}
                    className="btn-ghost btn-sm"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  {confirmDelete === service.id ? (
                    <span className="flex items-center gap-1.5">
                      <button
                        onClick={() => remove(service)}
                        disabled={saving}
                        className="inline-flex h-9 items-center rounded-full bg-red-600 px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="btn-ghost btn-sm">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(service.id)}
                      className="btn-ghost btn-sm text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
