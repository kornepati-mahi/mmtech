import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, User, Tag, FileQuestion } from 'lucide-react'
import { getBlogs, uploadUrl } from '../services/api'
import { useCachedData } from '../hooks/useCachedData'
import { FALLBACK_POSTS } from '../data/fallback'
import Loader from '../components/Loader'
import Reveal from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'

function formatDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogDetail() {
  const { slug } = useParams()
  const [data, loading] = useCachedData('blogs', getBlogs, { initial: FALLBACK_POSTS })

  const blogs = data ?? FALLBACK_POSTS

  const post = useMemo(() => blogs.find(b => String(b.slug) === String(slug)), [blogs, slug])
  const more = useMemo(
    () => blogs.filter(b => String(b.slug) !== String(slug)).slice(0, 3),
    [blogs, slug]
  )

  if (loading) {
    return (
      <div className="shell-narrow py-32">
        <Loader text="Loading article…" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="shell-narrow py-32">
        <div className="surface-solid p-10 text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-400">
            <FileQuestion size={24} />
          </span>
          <h1 className="display-3 mb-2">Article not found</h1>
          <p className="body-md mb-8">
            This post may be unpublished, still in draft, or the link may be out of date.
          </p>
          <Link to="/blog" className="btn-primary btn-md">
            <ArrowLeft size={16} />
            Back to insights
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ink-50">
      {/* Article header */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-white pb-14 pt-32 sm:pb-16 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 grid-overlay-light" />
        <div className="glow-orb -right-24 -top-24 h-72 w-72 bg-brand-200/40" />
        <div className="shell-narrow relative">
          <Link
            to="/blog"
            className="mb-7 inline-flex items-center gap-2 text-[13px] font-semibold text-ink-400 transition-colors hover:text-brand-600"
          >
            <ArrowLeft size={15} />
            All insights
          </Link>

          <Reveal>
            <span className="eyebrow mb-5">
              <Tag size={13} />
              {post.category || 'Insight'}
            </span>
            <h1 className="display-1 text-balance text-ink-900">{post.title}</h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-ink-400">
              {formatDate(post.published_date) && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={15} />
                  {formatDate(post.published_date)}
                </span>
              )}
              {post.author && (
                <span className="inline-flex items-center gap-2">
                  <User size={15} />
                  {post.author}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <Section className="pt-14 sm:pt-16">
        <div className="shell-narrow">
          <Reveal>
            <div className="surface-solid overflow-hidden">
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-ink-900 via-brand-800 to-brand-600 sm:h-72">
                {post.featured_image ? (
                  <img
                    src={uploadUrl(post.featured_image)}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 grid-overlay-dark opacity-70" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                        {post.category || 'MM IT Tech Insights'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-7 sm:p-12">
                {post.short_description && (
                  <p className="mb-8 border-l-4 border-brand-400 pl-5 text-[18px] font-medium leading-relaxed text-ink-700">
                    {post.short_description}
                  </p>
                )}

                <div className="space-y-5 text-[16px] leading-[1.8] text-ink-600">
                  {(post.content || post.short_description || '')
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>

                {!post.content && (
                  <p className="mt-8 rounded-2xl border border-ink-100 bg-ink-50 p-5 text-[14px] leading-relaxed text-ink-500">
                    The full article body endpoint can be connected in the next module. This MVP view
                    renders the published post content returned by the list API.
                  </p>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl bg-ink-900 p-7 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Want this applied to your business?</h3>
                <p className="mt-1.5 text-[14px] text-ink-300">
                  Our engineers can audit and implement it for you.
                </p>
              </div>
              <Link to="/contact" className="btn-primary btn-md shrink-0">
                Talk to our experts
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          {more.length > 0 && (
            <div className="mt-16">
              <h2 className="display-3 mb-8">Keep reading</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {more.map((b, i) => (
                  <Reveal key={b.id} delay={i * 0.07}>
                    <Link to={`/blog/${b.slug}`} className="surface-solid card-hover group flex h-full flex-col p-6">
                      <span className="mb-3 inline-block rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                        {b.category || 'Insight'}
                      </span>
                      <h3 className="mb-2 font-display text-[17px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
                        {b.title}
                      </h3>
                      <p className="body-md flex-1 line-clamp-2">{b.short_description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-brand-600">
                        Read
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
