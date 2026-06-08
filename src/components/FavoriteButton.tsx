import { useAppStore } from '../store/appStore'

interface Props {
  matchId: string
  active: boolean
}

export default function FavoriteButton({ matchId, active }: Props) {
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        void toggleFavorite(matchId)
      }}
      className="text-xl leading-none p-1 rounded-lg transition-opacity active:opacity-60"
      aria-label={active ? 'Quitar favorito' : 'Agregar a favoritos'}
    >
      {active ? '⭐' : '☆'}
    </button>
  )
}
