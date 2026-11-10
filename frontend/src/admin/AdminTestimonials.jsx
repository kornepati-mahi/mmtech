import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Image as ImageIcon,
  User,
} from 'lucide-react'
import {
  adminListTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  adminUploadImage,
  uploadUrl,
  invalidateCache,
} from '../services/api'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/ui/Reveal'

const BLANK = {
  id: null,
  client_name: '',
  company: '',
  message: '',
  rating: 5,
  photo: '',
  is_published: 1,
}

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    try {
      const res = await adminListTestimonials()
      setItems(res.data || [])
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not load reviews. Your session may have expired.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const published = useMemo(() => items.filter(i => Number(i.is_published) === 1).length, [items])

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
    try {
      const res = await adminUploadImage(file, e => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      })
      if (res.success) {
        setEditor(prev => ({ ...prev, photo: res.filename }))
        setMsg({ type: 'success', text: 'Photo uploaded. Save the review to keep it.' })
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
    if (!editor.client_name.trim() || !editor.message.trim()) {
      setMsg({ type: 'error', text: 'A client name and review text are required.' })
      return
    }

    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const payload = {
        id: editor.id ?? undefined,
        client_name: editor.client_name,
        company: editor.company,
        message: editor.message,
        rating: Number(editor.rating) || 5,
        photo: editor.photo,
        is_published: editor.is_published ? 1 : 0,
      }
      const res = editor.id ? await adminUpdateTestimonial(payload) : await adminCreateTestimonial(payload)
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Saved' })
        setEditor(null)
        invalidateCache('testimonials')
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

  const remove = async item => {
    setSaving(true)
    try {
      const res = await adminDeleteTestimonial({ id: item.id })
      if (res.success) {
        setItems(list => list.filter(i => i.id !== item.id))
        setMsg({ type: 'success', text: res.message || 'Review deleted' })
        setConfirmDelete(null)
        invalidateCache('testimonials')
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
            <MessageSquareQuote size={13} />
            Social proof
          </span>
          <h1 className="display-2">Client reviews</h1>
          <p className="body-md mt-2">
            {loading ? 'Loading reviews…' : `${published} published of ${items.length} total`}
          </p>
        </div>

        <button
          onClick={() => {
            setEditor({ ...BLANK })
            setMsg({ type: '', text: '' })
          }}
          className="btn-primary btn-md shrink-0"
        >
          <Plus size={16} />
          Add review
        </button>
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
                {editor.id ? 'Edit review' : 'New review'}
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
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="t-name">
                      Client name *
                    </label>
                    <div className="relative">
                      <User size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                      <input
                        id="t-name"
                        className="field pl-11"
                        value={editor.client_name}
                        onChange={e => setEditor({ ...editor, client_name: e.target.value })}
                        placeholder="Operations Manager"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="t-company">
                      Company
                    </label>
                    <input
                      id="t-company"
                      className="field"
                      value={editor.company}
                      onChange={e => setEditor({ ...editor, company: e.target.value })}
                      placeholder="SME Client"
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="t-message">
                    Review *
                  </label>
                  <textarea
                    id="t-message"
                    className="field resize-y"
                    rows={5}
                    value={editor.message}
                    onChange={e => setEditor({ ...editor, message: e.target.value })}
                    placeholder="Reliable support and quick response times helped us reduce downtime significantly."
                    required
                  />
                </div>

                <div>
                  <label className="label">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setEditor({ ...editor, rating: n })}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        className="transition-transform duration-200 hover:scale-115"
                      >
                        <Star
                          size={26}
                          className={n <= Number(editor.rating) ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-[13px] font-semibold text-ink-500">
                      {editor.rating} / 5
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">Client photo</label>
                  <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
                    {editor.photo ? (
                      <div className="relative">
                        <img src={uploadUrl(editor.photo)} alt="" className="h-36 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditor({ ...editor, photo: '' })}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-ink-900/70 text-white backdrop-blur transition-colors hover:bg-red-600"
                          aria-label="Remove photo"
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
                        {editor.photo ? 'Replace photo' : 'Upload photo'}
                      </>
                    )}
                  </button>
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-ink-200 bg-white px-4 py-3">
                  <span>
                    <span className="block text-[14px] font-semibold text-ink-800">Published</span>
                    <span className="block text-[12px] text-ink-400">Show this review on the site</span>
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-brand-600"
                    checked={Boolean(editor.is_published)}
                    onChange={e => setEditor({ ...editor, is_published: e.target.checked ? 1 : 0 })}
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
                      {editor.id ? 'Save changes' : 'Add review'}
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
          <span className="mt-3 text-sm text-ink-400">Loading reviews…</span>
        </div>
      ) : !items.length ? (
        <EmptyState
          title="No reviews yet"
          text="Add your first client review — it will appear on the Reviews page."
          action={
            <button onClick={() => setEditor({ ...BLANK })} className="btn-primary btn-md">
              <Plus size={16} />
              Add review
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.05, 0.3)}>
              <article className="surface-solid flex h-full flex-col p-6 transition-all duration-500 hover:shadow-md">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={15}
                        className={s < Number(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}
                      />
                    ))}
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                      Number(item.is_published) === 1
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-ink-200 bg-ink-100 text-ink-500'
                    }`}
                  >
                    {Number(item.is_published) === 1 ? 'Live' : 'Hidden'}
                  </span>
                </div>

                <blockquote className="mb-5 flex-1 text-[14px] leading-relaxed text-ink-600">
                  “{item.message}”
                </blockquote>

                <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
                    {item.photo ? (
                      <img src={uploadUrl(item.photo)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      String(item.client_name || '?').charAt(0)
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink-900">{item.client_name}</span>
                    {item.company && (
                      <span className="block truncate text-[13px] text-ink-400">{item.company}</span>
                    )}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditor({ ...BLANK, ...item })
                      setMsg({ type: '', text: '' })
                    }}
                    className="btn-ghost btn-sm"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  {confirmDelete === item.id ? (
                    <span className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => remove(item)}
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
                      onClick={() => setConfirmDelete(item.id)}
                      className="btn-ghost btn-sm ml-auto text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
