import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  back?: boolean
  right?: React.ReactNode
}

export default function PageHeader({ title, back = false, right }: Props) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-surface-1/95 backdrop-blur border-b border-rim"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center h-14 px-4 gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="text-gold text-xl p-1 -ml-1 leading-none"
            aria-label="Volver"
          >
            ‹
          </button>
        )}
        <h1 className="flex-1 text-lg font-bold text-ink truncate">{title}</h1>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
