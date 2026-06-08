interface Props {
  icon?: string
  title: string
  description?: string
}

export default function EmptyState({ icon = '📭', title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-semibold text-ink-2">{title}</p>
      {description && (
        <p className="text-sm text-ink-3 mt-2 leading-relaxed">{description}</p>
      )}
    </div>
  )
}
