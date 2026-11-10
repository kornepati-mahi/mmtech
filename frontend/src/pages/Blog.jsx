import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, User, FileText } from 'lucide-react'
import { getBlogs, uploadUrl } from '../services/api'
import { useCachedData } from '../hooks/useCachedData'
import { FALLBACK_POSTS } from '../data/fallback'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'

function formatDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Blog() {
  const [posts, loading] = useCachedData('blogs', getBlogs, { initial: FALLBACK_POSTS })
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState('All')

  const blogs = posts ?? FALLBACK_POSTS

  const source = blogs.length ? blogs : loading ? FALLBACK_POSTS : []
  const categories = useMemo(() => {
    const set = new Set(source.map(b => b.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [source])

  const filtered = active === 'All' ? source : source.filter(b => b.category === active)
  const [featured, ...rest] = filtered

  return (
    <div className="bg-ink-50">
      <PageHeader
        eyebrow="Insights"
        title="Practical ideas for a more resilient business"
        subtitle="Guides, checklists and field notes from our engineers on IT support, cloud and security."
      />

      <Section className="pt-14 sm:pt-16">
        <div className="shell">
          {/* Category filter */}
          {categories.length > 1 && (
            <Reveal className="mb-10 flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-300 ${
                    active === cat
                      ? 'border-transparent bg-ink-900 text-white shadow-md'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </Reveal>
          )}

          {!loading && failed && !blogs.length && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
              <span className="font-semibold">Showing our editorial archive —</span>
              <span>the live blog feed could not be reached from the API.</span>
            </div>
          )}

          {!source.length && (
            <EmptyState
              title="No articles published yet"
              text="Published posts from the CMS appear here as soon as they go live."
              action={
                <Link to="/contact" className="btn-primary btn-md">
                  Ask us a question
                  <ArrowRight size={16} />
                </Link>
              }
            />
          )}

          {featured && (
            <Reveal className="mb-8">
              <Link
                to={`/blog/${featured.slug}`}
                className="surface-solid group grid overflow-hidden lg:grid-cols-2"
              >
                <div className="relative min-h-[240px] overflow-hidden bg-gradient-to-br from-ink-900 via-brand-800 to-brand-600">
                  {featured.featured_image ? (
                    <img
                      src={uploadUrl(featured.featured_image)}
                      alt={featured.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 grid-overlay-dark opacity-70" />
                      <div className="absolute inset-0 grid place-items-center p-8">
                        <span className="rounded-full border border-white/25 bg-white/10 px-5 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                          Featured
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-[12px] font-semibold uppercase tracking-wider text-ink-400">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                      {featured.category || 'Insight'}
                    </span>
                    {formatDate(featured.published_date) && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {formatDate(featured.published_date)}
                      </span>
                    )}
                  </div>
                  <h2 className="display-3 mb-4 text-ink-900 transition-colors group-hover:text-brand-700">
                    {featured.title}
                  </h2>
                  <p className="body-md mb-7">{featured.short_description}</p>
                  <span className="inline-flex items-center gap-2 text-[15px] font-bold text-brand-600">
                    Read the article
                    <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((b, i) => (
                <Reveal key={b.id} delay={(i % 3) * 0.07}>
                  <article className="surface-solid card-hover group flex h-full flex-col overflow-hidden">
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-ink-800 to-brand-700">
                      {b.featured_image ? (
                        <img
                          src={uploadUrl(b.featured_image)}
                          alt={b.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 grid-overlay-dark opacity-70" />
                          <div className="absolute inset-0 grid place-items-center">
                            <FileText size={34} className="text-white/25" />
                          </div>
                        </>
                      )}
                      <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        {b.category || 'Insight'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-4 text-[12px] font-medium text-ink-400">
                        {formatDate(b.published_date) && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {formatDate(b.published_date)}
                          </span>
                        )}
                        {b.author && (
                          <span className="inline-flex items-center gap-1.5">
                            <User size={13} />
                            {b.author}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-2 font-display text-[18px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
                        {b.title}
                      </h3>
                      <p className="body-md flex-1 line-clamp-3">{b.short_description}</p>
                      <Link
                        to={`/blog/${b.slug}`}
                        className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-brand-600"
                      >
                        Read article
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
