import { Link } from 'react-router-dom'
import { Quote, Star, ArrowRight, MessageSquareQuote, Sparkles } from 'lucide-react'
import { getTestimonials, uploadUrl } from '../services/api'
import { useCachedData } from '../hooks/useCachedData'
import { useSiteSettings } from '../hooks/useSiteSettings'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/ui/Reveal'
import { Section } from '../components/ui/Section'

const FALLBACK = [
  {
    id: 'f1',
    client_name: 'Operations Manager',
    company: 'SME Client',
    message:
      'Reliable support and quick response times helped us reduce downtime significantly. Their engineers actually understand our estate.',
    rating: 5,
  },
  {
    id: 'f2',
    client_name: 'Business Owner',
    company: 'Retail Company',
    message: 'Professional cloud and security guidance with clear communication throughout the entire migration.',
    rating: 5,
  },
  {
    id: 'f3',
    client_name: 'IT Director',
    company: 'Manufacturing Group',
    message:
      'Threat monitoring caught two issues before they reached production. That alone paid for the engagement.',
    rating: 5,
  },
]

const SUMMARY = [
  { value: '4.9/5', label: 'Average client rating' },
  { value: '98%', label: 'Would recommend us' },
  { value: '250+', label: 'Active client accounts' },
]

export default function Testimonials() {
  const { stats } = useSiteSettings()
  const [data] = useCachedData('testimonials', getTestimonials, { initial: FALLBACK })

  const reviews = data && data.length ? data : FALLBACK

  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0'

  return (
    <div className="bg-ink-50">
      <PageHeader
        eyebrow="Client reviews"
        title="What partners say about working with MM IT Tech"
        subtitle="Real feedback from operations, IT and finance leaders across the businesses we support."
      >
        <div className="flex flex-wrap gap-3">
          {[
            { value: `${average}/5`, label: 'Average client rating' },
            { value: stats.recommend, label: 'Would recommend us' },
            { value: stats.clients, label: 'Active client accounts' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-sm">
              <p className="font-display text-xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-[12px] font-medium text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <Section className="pt-14 sm:pt-16">
        <div className="shell">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-400">
                <MessageSquareQuote size={24} />
              </span>
              <h3 className="mb-1 font-display text-lg font-bold text-ink-800">No reviews published yet</h3>
              <p className="max-w-md text-sm text-ink-500">
                Client reviews added from the admin panel appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((t, i) => (
                <Reveal key={t.id ?? i} delay={(i % 3) * 0.08} className="h-full">
                  <figure className="surface-solid card-hover group relative flex h-full flex-col p-7">
                    <Quote size={30} className="absolute right-6 top-6 text-brand-100 transition-colors group-hover:text-brand-200" />
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={15}
                          className={
                            s < Number(t.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
                          }
                        />
                      ))}
                    </div>
                    <blockquote className="flex-1 text-[15px] leading-relaxed text-ink-600">
                      “{t.message}”
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-5">
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-gradient font-display text-sm font-bold text-white">
                        {t.photo ? (
                          <img src={uploadUrl(t.photo)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          String(t.client_name || '?').charAt(0)
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-bold text-ink-900">
                          {t.client_name}
                        </span>
                        {t.company && (
                          <span className="block truncate text-[13px] text-ink-400">{t.company}</span>
                        )}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal className="mt-12">
            <div className="relative overflow-hidden rounded-4xl bg-hero-gradient px-8 py-14 text-center text-white sm:px-14">
              <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-70" />
              <div className="glow-orb -left-16 -top-16 h-72 w-72 bg-brand-600/30" />
              <div className="glow-orb -bottom-20 -right-10 h-72 w-72 bg-accent-500/25" />
              <div className="relative mx-auto max-w-2xl">
                <span className="eyebrow-dark mb-5">
                  <Sparkles size={13} />
                  Ready when you are
                </span>
                <h2 className="display-2 text-balance text-white">Join the businesses we protect</h2>
                <p className="body-lg mt-5 text-pretty text-ink-200">
                  Start with a free, no-obligation infrastructure review. We will tell you exactly where
                  the risk is.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/contact" className="btn-primary btn-lg">
                    Book your review
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/services" className="btn-ghost-dark btn-lg">
                    Explore services
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  )
}
