import { useNavigate } from 'react-router-dom'
import type { Team } from '../types'
import TeamFlag from './TeamFlag'

interface Props {
  team: Team
}

export default function TeamCard({ team }: Props) {
  const navigate = useNavigate()

  if (team.id === 'tbd') return null

  return (
    <div
      className="bg-surface-2 border border-rim rounded-xl p-4 flex items-center gap-4 cursor-pointer active:opacity-80"
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      <TeamFlag countryCode={team.countryCode} size={48} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink truncate">{team.name}</p>
        <p className="text-xs text-ink-3 mt-0.5">{team.confederation}</p>
      </div>
      {team.group && (
        <div className="flex flex-col items-center">
          <span className="text-xs text-ink-3">Grupo</span>
          <span className="text-lg font-bold text-gold">{team.group}</span>
        </div>
      )}
      <span className="text-ink-3 text-lg">›</span>
    </div>
  )
}
