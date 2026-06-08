import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  linkTo?: string
  linkLabel?: string
}

export default function SectionTitle({ title, linkTo, linkLabel = 'Ver todo' }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          className="text-xs text-gold font-medium"
        >
          {linkLabel} ›
        </button>
      )}
    </div>
  )
}
