import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { to: '/admin',                  label: 'Dashboard'      },
    { to: '/admin/spaces',           label: 'Espaces'        },
    { to: '/admin/equipments',       label: 'Equipements'    },
    { to: '/admin/reservations',     label: 'Reservations'   },
    { to: '/admin/users',            label: 'Utilisateurs'   },
  ]

  return (
    <div className="flex h-screen bg-gray-100">

      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-800">
            Coworking Space
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Panneau administrateur</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
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
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span className="block text-sm font-medium text-gray-700">
              {user?.name}
            </span>
            <span className="block text-xs text-gray-400 mt-0.5">
              Mon profil
            </span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            Deconnexion
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