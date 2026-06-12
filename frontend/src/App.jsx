import { Suspense, lazy, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Universities = lazy(() => import('./pages/Universities'))
const UniversityEvents = lazy(() => import('./pages/UniversityEvents'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const Loyalty = lazy(() => import('./pages/Loyalty'))
const SubmitEvent = lazy(() => import('./pages/SubmitEvent'))
const MyProposals = lazy(() => import('./pages/MyProposals'))
const Favorites = lazy(() => import('./pages/Favorites'))
const MapPage   = lazy(() => import('./pages/MapPage'))
const CityLanding = lazy(() => import('./pages/CityLanding'))

function PageLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="sk-title mb-4" />
      <div className="sk-text max-w-xl" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const lenisRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return                                  // respecte la préférence système
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 })
    lenisRef.current = lenis
    window.__lenis = lenis                       // accès global pour un scroll programmatique fluide
    let frameId = null
    const raf = (time) => { lenis.raf(time); frameId = requestAnimationFrame(raf) }
    const start = () => { if (frameId == null) frameId = requestAnimationFrame(raf) }
    const stop  = () => { if (frameId != null) { cancelAnimationFrame(frameId); frameId = null } }
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    start()
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      lenis.destroy()
      lenisRef.current = null
      window.__lenis = null
    }
  }, [])

  // Remonte en haut à chaque changement de page — sans heurter le smooth scroll
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-transition" key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/:id" element={<UniversityEvents />} />
            <Route path="/universities/:id/submit" element={
              <ProtectedRoute><SubmitEvent /></ProtectedRoute>
            } />
            <Route path="/my-proposals" element={
              <ProtectedRoute><MyProposals /></ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/loyalty" element={
              <ProtectedRoute><Loyalty /></ProtectedRoute>
            } />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/city/:name" element={<CityLanding />} />
            <Route path="/map"       element={<MapPage />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      {location.pathname !== '/map' && <Footer />}
      {location.pathname !== '/map' && <WhatsAppButton />}
    </div>
  )
}
