import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Universities from './pages/Universities'
import UniversityEvents from './pages/UniversityEvents'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Loyalty from './pages/Loyalty'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/universities/:id" element={<UniversityEvents />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/loyalty" element={
            <ProtectedRoute><Loyalty /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
