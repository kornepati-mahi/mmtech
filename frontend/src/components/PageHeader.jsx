import Reveal from './ui/Reveal'

/**
 * Lightweight page banner used at the top of inner pages.
 */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-white pb-12 pt-32 sm:pb-16 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-overlay-light" />
      <div className="glow-orb -right-20 -top-24 h-72 w-72 bg-brand-200/40" />
      <div className="glow-orb -left-24 top-10 h-64 w-64 bg-accent-200/30" />

      <div className="shell relative">
        <Reveal className="max-w-3xl">
          {eyebrow && (
            <span className="eyebrow mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {eyebrow}
            </span>
          )}
          <h1 className="display-1 text-balance text-ink-900">{title}</h1>
          {subtitle && <p className="body-lg mt-5 max-w-2xl text-pretty text-ink-500">{subtitle}</p>}
          {children && <div className="mt-7">{children}</div>}
        </Reveal>
      </div>
    </section>
  )
}
