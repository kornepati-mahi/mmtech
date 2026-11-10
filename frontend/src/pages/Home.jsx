import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Cloud,
  Headset,
  Server,
  Lock,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Award,
  Quote,
  Star,
  MonitorCog,
  Rocket,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import {
  getSettings,
  getServices,
  getBlogs,
  getTestimonials,
  uploadUrl,
} from '../services/api'
import { FALLBACK_SERVICES, FALLBACK_POSTS, splitList } from '../data/fallback'
import { useCachedData } from '../hooks/useCachedData'
import { useSiteSettings, DEFAULT_STATS } from '../hooks/useSiteSettings'
import Reveal from '../components/ui/Reveal'
import { Section, SectionHeading } from '../components/ui/Section'
import WhatsAppWidget from '../components/WhatsAppWidget'

const SERVICE_ICONS = [Headset, Cloud, ShieldCheck]

const STATS = [
  { value: 'years', label: 'Years of experience', icon: Award },
  { value: 'uptime', label: 'Platform uptime', icon: MonitorCog },
  { value: 'endpoints', label: 'Endpoints managed', icon: Server },
  { value: 'response', label: 'Average response', icon: Zap },
]

const PILLARS = [
  {
    icon: Lock,
    title: 'Security-first by default',
    text: 'Zero-trust access, hardened endpoints and continuous patching keep threats out before they land.',
  },
  {
    icon: LineChart,
    title: 'Performance you can measure',
    text: 'Live dashboards, SLA reporting and proactive capacity planning keep every workload in the green.',
  },
  {
    icon: Users,
    title: 'Real engineers, not tiers',
    text: 'You talk to senior consultants who know your environment instead of reading from a script.',
  },
  {
    icon: Rocket,
    title: 'Built to scale with you',
    text: 'Cloud-first architecture that grows from ten seats to a thousand without a rebuild.',
  },
]

const PROCESS = [
  { step: '01', title: 'Discover', text: 'We audit your estate, map risks and agree on outcomes that matter to your business.' },
  { step: '02', title: 'Design', text: 'A pragmatic plan with clear pricing, timelines and responsibilities — no jargon.' },
  { step: '03', title: 'Deploy', text: 'Zero-downtime migration, tested change windows and a full handover runbook.' },
  { step: '04', title: 'Optimise', text: 'Continuous monitoring and quarterly reviews that keep performance climbing.' },
]

const FALLBACK_TESTIMONIALS = [
  {
    id: 'ft1',
    client_name: 'Operations Manager',
    company: 'SME Client',
    message:
      'Reliable support and genuinely quick response times helped us cut unplanned downtime to almost nothing.',
    rating: 5,
  },
  {
    id: 'ft2',
    client_name: 'Business Owner',
    company: 'Retail Company',
    message:
      'Professional cloud and security guidance, with clear communication at every step of the migration.',
    rating: 5,
  },
  {
    id: 'ft3',
    client_name: 'Head of IT',
    company: 'Logistics Group',
    message:
      'Our team stopped worrying about infrastructure. That alone changed how we plan our quarter.',
    rating: 5,
  },
]

const STACK = ['Windows Server', 'Microsoft 365', 'Azure', 'AWS', 'Linux', 'VMware', 'Fortinet', 'Veeam', 'Sophos']

export default function Home() {
  const { stats } = useSiteSettings()
  const [settings] = useCachedData('settings', getSettings)
  const [services] = useCachedData('services', getServices, { initial: FALLBACK_SERVICES })
  const [blogs] = useCachedData('blogs', getBlogs, { initial: FALLBACK_POSTS.slice(0, 3) })
  const [reviews] = useCachedData('testimonials', getTestimonials)

  const serviceList = services?.length ? services.slice(0, 3) : FALLBACK_SERVICES
  const postList = blogs?.length ? blogs.slice(0, 3) : FALLBACK_POSTS.slice(0, 3)
  const reviewList = reviews?.length ? reviews.slice(0, 3) : FALLBACK_TESTIMONIALS

  const heroTitle = settings?.hero_title || 'Powering Your Business with Smarter IT Solutions.'
  const heroDesc =
    settings?.hero_description ||
    'Reliable IT Support, Advanced Cloud Services, and Enterprise-Grade Cybersecurity to Keep Your Business Running Without Limits.'
  const ctaText = settings?.cta_text || 'Talk to Our Experts'

  // Highlight the last two words of the headline when the title is long enough.
  const words = heroTitle.trim().split(/\s+/)
  const hasLead = words.length > 3
  const heroLead = hasLead ? words.slice(0, -2).join(' ') : ''
  const heroAccent = hasLead ? words.slice(-2).join(' ') : heroTitle

  return (
    <div className="bg-ink-50">
      <WhatsAppWidget />
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-hero-gradient pb-24 pt-32 text-white sm:pb-28 sm:pt-40 lg:pb-36 lg:pt-44">
        <div className="pointer-events-none absolute inset-0 grid-overlay-dark" />
        <div className="glow-orb -left-32 top-10 h-[420px] w-[420px] bg-brand-600/35 animate-float" />
        <div className="glow-orb right-[-120px] top-40 h-[460px] w-[460px] bg-accent-500/25 animate-drift" />
        <div className="glow-orb bottom-[-160px] left-1/3 h-[380px] w-[380px] bg-violet-500/20" />

        <div className="shell relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="eyebrow-dark mb-7"
            >
              <Sparkles size={13} />
              Premium IT solutions partner
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="display-1 text-balance text-white"
            >
              {hasLead && `${heroLead} `}
              <span className="text-gradient-dark">{heroAccent}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="body-lg mt-7 max-w-xl text-pretty text-ink-200"
            >
              {heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link to="/contact" className="btn-primary btn-lg">
                {ctaText}
                <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="btn-ghost-dark btn-lg">
                Explore our services
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3"
            >
              {['ISO-aligned processes', '24/7 monitoring', 'SLA-backed support'].map(item => (
                <span key={item} className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-300">
                  <CheckCircle2 size={15} className="text-accent-400" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Floating glass panel */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -inset-3 rounded-[2.25rem] bg-gradient-to-br from-brand-500/25 to-accent-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                    Infrastructure health
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-white">99.98%</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-[12px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  All systems healthy
                </span>
              </div>

              <div className="mt-7 space-y-4">
                {[
                  { label: 'Cloud workloads', value: 99, tone: 'from-brand-500 to-accent-400' },
                  { label: 'Endpoint security', value: 100, tone: 'from-accent-400 to-emerald-400' },
                  { label: 'Backup integrity', value: 96, tone: 'from-violet-500 to-brand-500' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="font-medium text-ink-300">{bar.label}</span>
                      <span className="font-mono font-semibold text-white">{bar.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full bg-gradient-to-r ${bar.tone}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
                {[
                  ['4,912', 'Devices'],
                  ['0', 'Incidents'],
                  ['24/7', 'Cover'],
                ].map(([val, label]) => (
                  <div key={label}>
                    <p className="font-display text-lg font-bold text-white">{val}</p>
                    <p className="text-[11px] uppercase tracking-wider text-ink-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tech marquee */}
        <div className="shell relative mt-20">
          <div className="mask-fade-x overflow-hidden">
            <div className="flex w-max animate-marquee gap-3">
              {[...STACK, ...STACK].map((tech, i) => (
                <span
                  key={`${tech}-${i}`}
                  className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[13px] font-semibold text-ink-300 backdrop-blur"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative z-10 -mt-12">
        <div className="shell">
          <Reveal className="grid gap-px overflow-hidden rounded-4xl border border-ink-100 bg-ink-100 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="group bg-white px-6 py-7 transition-colors hover:bg-ink-50">
                <div className="mb-3 flex items-center justify-between">
                  <s.icon size={19} className="text-brand-600" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-200 transition-colors group-hover:bg-brand-400" />
                </div>
                <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
                  {stats[s.value] ?? DEFAULT_STATS[s.value]}
                </p>
                <p className="mt-1 text-[13px] font-medium text-ink-500">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <Section className="pt-20 sm:pt-24">
        <div className="shell">
          <SectionHeading
            eyebrow="What we do"
            title="Core services built for modern IT estates"
            description="From day-to-day support to full cloud transformation — one accountable partner across your whole stack."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceList.map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
              const features = splitList(s.features)
              return (
                <Reveal key={s.id ?? s.slug} delay={i * 0.08}>
                  <Link
                    to={s.slug ? `/services/${s.slug}` : '/services'}
                    className="surface-solid card-hover group relative flex h-full flex-col overflow-hidden p-7"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-100/60 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                    <div className="relative mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow transition-transform duration-500 group-hover:scale-110">
                      <Icon size={24} />
                    </div>
                    <h3 className="relative mb-3 font-display text-xl font-bold text-ink-900">{s.name}</h3>
                    <p className="relative body-md flex-1">{s.description}</p>

                    {features.length > 0 && (
                      <ul className="relative mt-5 flex flex-wrap gap-2">
                        {features.slice(0, 3).map(f => (
                          <li
                            key={f}
                            className="rounded-full bg-ink-50 px-3 py-1 text-[12px] font-semibold text-ink-600"
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <span className="relative mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-brand-600 transition-colors group-hover:text-brand-700">
                      Explore service
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="mt-10 flex justify-center">
            <Link to="/services" className="btn-ghost btn-md">
              View all services
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* ================= PILLARS (dark) ================= */}
      <Section dark className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-overlay-dark opacity-60" />
        <div className="glow-orb -right-24 top-0 h-96 w-96 bg-brand-600/25" />
        <div className="glow-orb bottom-0 left-0 h-80 w-80 bg-accent-500/15" />

        <div className="shell relative">
          <SectionHeading
            dark
            eyebrow="Why MM IT Tech"
            title="An IT partner that thinks like your business"
            description="We combine people, process and automation so technology stops being a fire drill and starts being an advantage."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent-400/30 hover:bg-white/[0.07]">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 text-accent-300 transition-colors group-hover:text-accent-200">
                    <p.icon size={22} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-300">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ================= PROCESS ================= */}
      <Section>
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <span className="eyebrow mb-5">
                  <RefreshCw size={13} />
                  How we work
                </span>
                <h2 className="display-2 text-balance">
                  A delivery method built around <span className="text-gradient">zero drama</span>
                </h2>
                <p className="body-lg mt-5 text-pretty">
                  Four predictable stages, clear owners and a documented handover — so you always know
                  where your IT stands.
                </p>
                <Link to="/contact" className="btn-dark btn-lg mt-8">
                  Start with a free audit
                  <ArrowRight size={18} />
                </Link>
              </Reveal>
            </div>

            <div className="relative">
              <div className="absolute left-[27px] top-4 bottom-4 hidden w-px bg-gradient-to-b from-brand-300 via-ink-200 to-transparent sm:block" />
              <div className="space-y-4">
                {PROCESS.map((p, i) => (
                  <Reveal key={p.step} delay={i * 0.08}>
                    <div className="group relative flex gap-5 rounded-3xl border border-transparent p-4 transition-all duration-500 hover:border-ink-100 hover:bg-white hover:shadow-sm sm:gap-6">
                      <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-ink-100 bg-white font-mono text-[13px] font-bold text-brand-600 shadow-sm transition-transform duration-500 group-hover:scale-105">
                        {p.step}
                      </div>
                      <div className="pb-2">
                        <h3 className="mb-1.5 font-display text-lg font-bold text-ink-900">{p.title}</h3>
                        <p className="body-md">{p.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ================= TESTIMONIALS ================= */}
      <Section className="bg-white">
        <div className="shell">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Client feedback"
              title="Trusted by teams that cannot afford downtime"
              className="sm:max-w-xl"
            />
            <Reveal delay={0.1}>
              <Link to="/testimonials" className="btn-ghost btn-md">
                Read all reviews
                <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {reviewList.map((t, i) => (              <Reveal key={t.id ?? t.name} delay={i * 0.08} className="h-full">
                <figure className="surface-solid card-hover relative flex h-full flex-col p-7">
                  <Quote size={30} className="absolute right-6 top-6 text-brand-100" />
                  <div className="mb-4 flex items-center gap-0.5">
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
                        String(t.client_name || t.name || '?').charAt(0)
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-bold text-ink-900">
                        {t.client_name || t.name}
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
        </div>
      </Section>

      {/* ================= BLOG ================= */}
      {postList.length > 0 && (
        <Section>
          <div className="shell">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                align="left"
                eyebrow="Latest insights"
                title="Ideas to keep your IT sharp"
                className="sm:max-w-xl"
              />
              <Reveal delay={0.1}>
                <Link to="/blog" className="btn-ghost btn-md">
                  All articles
                  <ArrowRight size={16} />
                </Link>
              </Reveal>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {postList.map((b, i) => (
                <Reveal key={b.id} delay={i * 0.08}>
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
                            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-white backdrop-blur">
                              {b.category || 'Insight'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-400">
                        {b.published_date
                          ? new Date(b.published_date).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Latest'}
                      </span>
                      <h3 className="mb-2 font-display text-lg font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
                        {b.title}
                      </h3>
                      <p className="body-md flex-1 line-clamp-3">{b.short_description}</p>
                      {b.slug && (
                        <Link
                          to={`/blog/${b.slug}`}
                          className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-brand-600"
                        >
                          Read article
                          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}
