import Reveal from './Reveal'

/**
 * Section shell with consistent vertical rhythm + optional dark theme.
 */
export function Section({ children, id, dark = false, className = '', pad = true }) {
  return (
    <section
      id={id}
      className={`relative ${pad ? 'py-16 sm:py-20 lg:py-28' : ''} ${
        dark ? 'bg-ink-900 text-white' : ''
      } ${className}`}
    >
      {children}
    </section>
  )
}

export function SectionHeading({ eyebrow, title, description, dark = false, align = 'center', className = '' }) {
  const alignCls = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'
  return (
    <Reveal className={`flex max-w-2xl flex-col gap-4 ${alignCls} ${className}`}>
      {eyebrow && (
        <span className={dark ? 'eyebrow-dark' : 'eyebrow'}>
          <span className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-accent-400' : 'bg-brand-500'}`} />
          {eyebrow}
        </span>
      )}
      <h2 className={`display-2 ${dark ? 'text-white' : 'text-ink-900'}`}>{title}</h2>
      {description && (
        <p className={`body-lg text-pretty ${dark ? 'text-ink-300' : 'text-ink-500'}`}>{description}</p>
      )}
    </Reveal>
  )
}

export default Section
