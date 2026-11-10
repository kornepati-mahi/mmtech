export default function Logo({
  className = '',
  size = 40,
  withText = true,
  subtitle = 'Smarter IT Solutions',
  light = false,
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="grid shrink-0 place-items-center rounded-2xl bg-brand-gradient shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" fill="none" width={size * 0.62} height={size * 0.62} aria-hidden="true">
          <path
            d="M7 24V9l9 9 9-9v15"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText && (
        <span className="flex flex-col">
          <span
            className={`font-display text-[17px] font-extrabold leading-tight tracking-tight ${
              light ? 'text-white' : 'text-ink-900'
            }`}
          >
            MM IT Tech
            <span className={light ? 'text-accent-300' : 'text-brand-600'}> Ltd</span>
          </span>
          <span
            className={`mt-1 text-[10px] font-semibold uppercase leading-none tracking-[0.16em] ${
              light ? 'text-ink-400' : 'text-ink-400'
            }`}
          >
            {subtitle}
          </span>
        </span>
      )}
    </span>
  )
}
