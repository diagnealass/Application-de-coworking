import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

import HomePage        from './pages/public/HomePage'
import RegisterPage    from './pages/public/RegisterPage'
import LoginPage       from './pages/auth/LoginPage'

import Layout          from './components/layout/Layout'
import MemberLayout    from './components/layout/MemberLayout'

import DashboardPage   from './pages/dashboard/DashboardPage'
import SpacesPage      from './pages/spaces/SpacesPage'
import EquipmentsPage  from './pages/equipments/EquipmentsPage'
import ReservationsPage from './pages/reservations/ReservationsPage'
import UsersPage       from './pages/users/UsersPage'
import ProfilePage     from './pages/profile/ProfilePage'

import MemberDashboard from './pages/member/MemberDashboard'
import MemberSpaces    from './pages/member/MemberSpaces'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/member/dashboard" replace />
  return <>{children}</>
}

function MemberRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <BrowserRouter>
      <Routes>

        {/* Pages publiques */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login"    element={<LoginPage />} />

        {/* Interface Admin */}
        <Route path="/admin" element={
          <AdminRoute><Layout /></AdminRoute>
        }>
          <Route index           element={<DashboardPage />} />
          <Route path="spaces"       element={<SpacesPage />} />
          <Route path="equipments"   element={<EquipmentsPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="users"        element={<UsersPage />} />
          <Route path="profile"      element={<ProfilePage />} />
        </Route>

        {/* Interface Membre */}
        <Route path="/member" element={
          <MemberRoute><MemberLayout /></MemberRoute>
        }>
          <Route index              element={<MemberDashboard />} />
          <Route path="dashboard"   element={<MemberDashboard />} />
          <Route path="spaces"      element={<MemberSpaces />} />
          <Route path="profile"     element={<ProfilePage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}