import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/fixture', label: 'Fixture', icon: '📅' },
  { to: '/standings', label: 'Grupos', icon: '📊' },
  { to: '/pronosticos', label: 'Pronósticos', icon: '🎯' },
  { to: '/admin', label: 'Admin', icon: '⚙️' },
]

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-1 border-t border-rim z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-gold' : 'text-ink-3'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
