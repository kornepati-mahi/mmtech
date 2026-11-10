import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Eye,
  Save,
  CalendarDays,
  Filter,
} from 'lucide-react'
import {
  adminListPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminUploadImage,
  uploadUrl,
  invalidateCache,
} from '../services/api'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/ui/Reveal'

const STATUSES = ['Draft', 'Published', 'Scheduled']

const STATUS_STYLES = {
  Draft: 'bg-ink-100 text-ink-500 border-ink-200',
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
}

const BLANK = {
  id: null,
  title: '',
  slug: '',
  short_description: '',
  content: '',
  category: 'General',
  author: 'MM IT Tech Team',
  status: 'Draft',
  featured_image: '',
  published_date: '',
}

export default function AdminBlogs() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [editor, setEditor] = useState(null) // null | 'new' | post object
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const fileRef = useRef(null)

  const load = async () => {
    try {
      const res = await adminListPosts()
      setPosts(res.data || [])
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not load posts. Your session may have expired.' })
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
    return posts.filter(p => {
      const statusOk = filter === 'All' || p.status === filter
      const queryOk =
        !q ||
        [p.title, p.category, p.author, p.short_description]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      return statusOk && queryOk
    })
  }, [posts, query, filter])

  const counts = useMemo(() => {
    const out = { All: posts.length, Draft: 0, Published: 0, Scheduled: 0 }
    posts.forEach(p => {
      if (out[p.status] !== undefined) out[p.status] += 1
    })
    return out
  }, [posts])

  /* ---------------- Image upload ---------------- */
  const onPickImage = async e => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Please choose an image file (JPG, PNG, WEBP or GIF).' })
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
        setEditor(prev => ({ ...prev, featured_image: res.filename }))
        setMsg({ type: 'success', text: 'Image uploaded. Save the post to keep it.' })
      } else {
        setMsg({ type: 'error', text: res.message || 'Upload failed.' })
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Upload failed. Check the backend is running.',
      })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  /* ---------------- Save / delete ---------------- */
  const save = async e => {
    e.preventDefault()
    if (!editor) return
    if (!editor.title.trim()) {
      setMsg({ type: 'error', text: 'Please give the post a title.' })
      return
    }

    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const payload = {
        id: editor.id ?? undefined,
        title: editor.title,
        slug: editor.slug || editor.title,
        short_description: editor.short_description,
        content: editor.content,
        category: editor.category,
        author: editor.author,
        status: editor.status,
        featured_image: editor.featured_image,
        published_date: editor.published_date,
      }
      const res = editor.id ? await adminUpdatePost(payload) : await adminCreatePost(payload)
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Saved' })
        setEditor(null)
        invalidateCache('blogs')
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

  const remove = async post => {
    setSaving(true)
    try {
      const res = await adminDeletePost({ id: post.id })
      if (res.success) {
        setPosts(list => list.filter(p => p.id !== post.id))
        setMsg({ type: 'success', text: res.message || 'Post deleted' })
        setConfirmDelete(null)
        invalidateCache('blogs')
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
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow mb-4">
            <FileText size={13} />
            Content
          </span>
          <h1 className="display-2">Blog posts</h1>
          <p className="body-md mt-2">
            {loading ? 'Loading posts…' : `${filtered.length} of ${posts.length} shown`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              className="field w-full pl-11 sm:w-64"
              placeholder="Search title, category…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditor({ ...BLANK })
              setMsg({ type: '', text: '' })
            }}
            className="btn-primary btn-md shrink-0"
          >
            <Plus size={16} />
            New post
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

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['All', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-300 ${
              filter === s
                ? 'border-transparent bg-ink-900 text-white shadow-md'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {s === 'All' ? <Filter size={13} /> : null}
            {s}
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${filter === s ? 'bg-white/15' : 'bg-ink-100'}`}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Editor */}
      {editor && (
        <Reveal className="mb-8">
          <form onSubmit={save} className="surface-solid overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50 px-6 py-4">
              <h2 className="font-display text-[17px] font-bold text-ink-900">
                {editor.id ? 'Edit post' : 'New post'}
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
              {/* Main fields */}
              <div className="space-y-5">
                <div>
                  <label className="label" htmlFor="post-title">
                    Title *
                  </label>
                  <input
                    id="post-title"
                    className="field"
                    value={editor.title}
                    onChange={e => setEditor({ ...editor, title: e.target.value })}
                    placeholder="How we cut cloud costs by a third"
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="post-short">
                    Short description
                  </label>
                  <textarea
                    id="post-short"
                    className="field resize-y"
                    rows={2}
                    value={editor.short_description}
                    onChange={e => setEditor({ ...editor, short_description: e.target.value })}
                    placeholder="One or two sentences shown on cards and search results."
                  />
                </div>

                <div>
                  <label className="label" htmlFor="post-content">
                    Article content
                  </label>
                  <textarea
                    id="post-content"
                    className="field resize-y font-mono text-[13px]"
                    rows={12}
                    value={editor.content}
                    onChange={e => setEditor({ ...editor, content: e.target.value })}
                    placeholder={'Write the full article here.\n\nSeparate paragraphs with a blank line.'}
                  />
                  <p className="mt-2 text-[12px] text-ink-400">
                    Blank lines split the article into paragraphs on the public page.
                  </p>
                </div>
              </div>

              {/* Sidebar fields */}
              <div className="space-y-5">
                {/* Image */}
                <div>
                  <label className="label">Featured image</label>
                  <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
                    {editor.featured_image ? (
                      <div className="relative">
                        <img
                          src={uploadUrl(editor.featured_image)}
                          alt="Featured"
                          className="h-40 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setEditor({ ...editor, featured_image: '' })}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-ink-900/70 text-white backdrop-blur transition-colors hover:bg-red-600"
                          aria-label="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid h-40 place-items-center text-ink-300">
                        <ImageIcon size={30} />
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
                        {editor.featured_image ? 'Replace image' : 'Upload image'}
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-[12px] text-ink-400">JPG, PNG, WEBP or GIF · max 5 MB</p>
                </div>

                <div>
                  <label className="label" htmlFor="post-category">
                    Category
                  </label>
                  <input
                    id="post-category"
                    className="field"
                    value={editor.category}
                    onChange={e => setEditor({ ...editor, category: e.target.value })}
                    placeholder="Cloud"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="post-author">
                    Author
                  </label>
                  <input
                    id="post-author"
                    className="field"
                    value={editor.author}
                    onChange={e => setEditor({ ...editor, author: e.target.value })}
                    placeholder="MM IT Tech Team"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="post-status">
                    Status
                  </label>
                  <select
                    id="post-status"
                    className="field appearance-none"
                    value={editor.status}
                    onChange={e => setEditor({ ...editor, status: e.target.value })}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="post-date">
                    Publish date
                  </label>
                  <input
                    id="post-date"
                    className="field"
                    type="date"
                    value={editor.published_date ? String(editor.published_date).slice(0, 10) : ''}
                    onChange={e => setEditor({ ...editor, published_date: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-primary btn-md w-full">
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editor.id ? 'Save changes' : 'Create post'}
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
          <span className="mt-3 text-sm text-ink-400">Loading posts…</span>
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title={posts.length ? 'No matching posts' : 'No blog posts yet'}
          text={
            posts.length
              ? 'Try a different search term or status filter.'
              : 'Create your first post to publish it on the Insights page.'
          }
          action={
            <button
              onClick={() => setEditor({ ...BLANK })}
              className="btn-primary btn-md"
            >
              <Plus size={16} />
              New post
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i * 0.05, 0.3)}>
              <article className="surface-solid group flex h-full flex-col overflow-hidden transition-all duration-500 hover:shadow-md">
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-ink-800 to-brand-700">
                  {post.featured_image ? (
                    <img
                      src={uploadUrl(post.featured_image)}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 grid-overlay-dark opacity-70" />
                      <div className="absolute inset-0 grid place-items-center">
                        <ImageIcon size={30} className="text-white/25" />
                      </div>
                    </>
                  )}
                  <span
                    className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-bold ${
                      STATUS_STYLES[post.status] || STATUS_STYLES.Draft
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-[12px] font-medium text-ink-400">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-bold text-brand-700">
                      {post.category || 'General'}
                    </span>
                    {post.published_date && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        {new Date(post.published_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 font-display text-[16px] font-bold leading-snug text-ink-900">
                    {post.title}
                  </h3>
                  <p className="body-md flex-1 line-clamp-3 text-[14px]">
                    {post.short_description || 'No summary provided.'}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4">
                    <button
                      onClick={() => {
                        setEditor({
                          ...BLANK,
                          ...post,
                          published_date: post.published_date || '',
                        })
                        setMsg({ type: '', text: '' })
                      }}
                      className="btn-ghost btn-sm"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    {post.status === 'Published' && post.slug && (
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost btn-sm"
                      >
                        <Eye size={13} />
                        View
                      </Link>
                    )}

                    {confirmDelete === post.id ? (
                      <span className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => remove(post)}
                          disabled={saving}
                          className="btn-sm inline-flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3.5 font-bold text-white transition-colors hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="btn-ghost btn-sm"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(post.id)}
                        className="btn-ghost btn-sm ml-auto text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
