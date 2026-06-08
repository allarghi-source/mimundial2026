interface FilterOption {
  value: string
  label: string
}

interface Props {
  options: FilterOption[]
  value: string
  onChange: (v: string) => void
}

export default function FilterBar({ options, value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            value === opt.value
              ? 'bg-gold text-night border-gold'
              : 'bg-surface-3 text-ink-2 border-rim'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
