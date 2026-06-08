import { CircleFlag } from 'react-circle-flags'

interface Props {
  countryCode?: string
  size?: number
  className?: string
}

export default function TeamFlag({ countryCode, size = 40, className = '' }: Props) {
  if (!countryCode) {
    return (
      <div
        className={`rounded-full bg-surface-3 border border-rim flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-ink-3" style={{ fontSize: size * 0.45 }}>?</span>
      </div>
    )
  }

  return (
    <CircleFlag
      countryCode={countryCode}
      height={size}
      className={`shrink-0 ${className}`}
    />
  )
}
