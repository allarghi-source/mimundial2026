interface Props {
  label: string
  value: string | number
  icon?: string
}

export default function StatCard({ label, value, icon }: Props) {
  return (
    <div className="bg-surface-2 border border-rim rounded-xl p-4 flex flex-col gap-1">
      {icon && <span className="text-xl">{icon}</span>}
      <span className="text-2xl font-bold text-gold">{value}</span>
      <span className="text-xs text-ink-3 font-medium">{label}</span>
    </div>
  )
}
