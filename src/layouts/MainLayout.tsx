import { Outlet } from 'react-router-dom'
import BottomNavigation from '../components/BottomNavigation'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface-1 text-ink">
      <main className="pb-24">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
