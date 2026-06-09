import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import { useAppStore } from './store/appStore'

const Home = lazy(() => import('./pages/Home'))
const Fixture = lazy(() => import('./pages/Fixture'))
const Teams = lazy(() => import('./pages/Teams'))
const TeamDetail = lazy(() => import('./pages/TeamDetail'))
const Venues = lazy(() => import('./pages/Venues'))
const VenueDetail = lazy(() => import('./pages/VenueDetail'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Settings = lazy(() => import('./pages/Settings'))
const MatchDetail = lazy(() => import('./pages/MatchDetail'))
const Standings = lazy(() => import('./pages/Standings'))
const Admin = lazy(() => import('./pages/Admin'))
const Pronosticos = lazy(() => import('./pages/Pronosticos'))

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-1">
      <span className="text-4xl animate-pulse">⚽</span>
    </div>
  )
}

export default function App() {
  const init = useAppStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/fixture" element={<Fixture />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pronosticos" element={<Pronosticos />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
