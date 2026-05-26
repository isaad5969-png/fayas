import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Universities = lazy(() => import('./pages/Universities'))
const UniversityEvents = lazy(() => import('./pages/UniversityEvents'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const Loyalty = lazy(() => import('./pages/Loyalty'))
const SubmitEvent = lazy(() => import('./pages/SubmitEvent'))
const MyProposals = lazy(() => import('./pages/MyProposals'))
const Favorites = lazy(() => import('./pages/Favorites'))
const MapPage   = lazy(() => import('./pages/MapPage'))

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

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

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
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/loyalty" element={
              <ProtectedRoute><Loyalty /></ProtectedRoute>
            } />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/map"       element={<MapPage />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
