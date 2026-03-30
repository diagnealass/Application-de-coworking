import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function MemberLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-800">Coworking Space</h1>
          <p className="text-sm text-gray-500 mt-1">Espace membre</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { to: '/member/dashboard',    label: 'Mes réservations' },
            { to: '/member/spaces',       label: 'Réserver un espace' },
            { to: '/member/profile',      label: 'Mon profil' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>

    </div>
  )
}