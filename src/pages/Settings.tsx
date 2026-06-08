import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAppStore } from '../store/appStore'
import { requestPermission, isSupported } from '../services/notifications'

export default function Settings() {
  const navigate = useNavigate()
  const preferences = useAppStore((s) => s.preferences)
  const updatePreferences = useAppStore((s) => s.updatePreferences)

  const menuItems = [
    { icon: '📅', label: 'Fixture completo', to: '/fixture' },
    { icon: '🌍', label: 'Equipos', to: '/teams' },
    { icon: '🏟', label: 'Sedes', to: '/venues' },
    { icon: '📆', label: 'Mi calendario', to: '/calendar' },
  ]

  async function handleEnableNotifications() {
    if (!isSupported()) {
      alert('Las notificaciones no están soportadas en este dispositivo.')
      return
    }
    const perm = await requestPermission()
    if (perm === 'granted') {
      await updatePreferences({ notifications: true })
    } else {
      alert('Permiso denegado. Habilitá las notificaciones desde la configuración del navegador.')
    }
  }

  return (
    <div>
      <PageHeader title="Más" />
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-rim">
            <p className="text-xs text-ink-3 font-semibold uppercase tracking-wider">Navegación</p>
          </div>
          {menuItems.map((item, i) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-surface-3 ${
                i < menuItems.length - 1 ? 'border-b border-rim' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-left text-sm text-ink">{item.label}</span>
              <span className="text-ink-3">›</span>
            </button>
          ))}
        </div>

        <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-rim">
            <p className="text-xs text-ink-3 font-semibold uppercase tracking-wider">Preferencias</p>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <p className="text-sm text-ink">Notificaciones</p>
                <p className="text-xs text-ink-3">Recordatorios de partidos</p>
              </div>
            </div>
            <button
              onClick={() => void handleEnableNotifications()}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications ? 'bg-gold' : 'bg-rim'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-surface-2 border border-rim rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-rim">
            <p className="text-xs text-ink-3 font-semibold uppercase tracking-wider">Info</p>
          </div>
          <div className="px-4 py-3.5 border-b border-rim">
            <p className="text-sm text-ink">Mi Mundial 2026</p>
            <p className="text-xs text-ink-3 mt-0.5">Versión 1.0.0</p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-sm text-ink">Zona horaria</p>
            <p className="text-xs text-ink-3 mt-0.5">Argentina (ART, UTC−3)</p>
          </div>
        </div>

        <p className="text-center text-xs text-ink-3 pb-4">
          Datos almacenados localmente · Sin conexión necesaria
        </p>
      </div>
    </div>
  )
}
