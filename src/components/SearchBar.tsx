interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }: Props) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-3 border border-rim rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-3 outline-none focus:border-gold transition-colors"
      />
    </div>
  )
}
