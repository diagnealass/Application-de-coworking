import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'

interface DashboardStats {
  total_spaces: number
  total_equipments: number
  total_users: number
  total_reservations: number
  pending: number
  confirmed: number
  cancelled: number
  revenue: number
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard')
      return data
    },
  })

  const stats: DashboardStats = data?.stats

  const cards = [
    { label: 'Espaces',        value: stats?.total_spaces,       color: 'bg-blue-50 text-blue-700'   },
    { label: 'Équipements',    value: stats?.total_equipments,   color: 'bg-purple-50 text-purple-700' },
    { label: 'Membres',        value: stats?.total_users,        color: 'bg-green-50 text-green-700'  },
    { label: 'Réservations',   value: stats?.total_reservations, color: 'bg-orange-50 text-orange-700' },
  ]

  const statusCards = [
    { label: 'En attente',  value: stats?.pending,   color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Confirmées',  value: stats?.confirmed, color: 'bg-green-50 text-green-700'   },
    { label: 'Annulées',    value: stats?.cancelled, color: 'bg-red-50 text-red-700'       },
    { label: 'Revenus (FCFA)', value: stats?.revenue?.toLocaleString(), color: 'bg-blue-50 text-blue-700' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre espace</p>
      </div>

      {/* Stats principales */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Statistiques générales
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-semibold mt-2 ${color.split(' ')[1]}`}>
                {value ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats réservations */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Réservations
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-semibold mt-2 ${color.split(' ')[1]}`}>
                {value ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dernières réservations */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Dernières réservations
        </h3>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Membre</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Espace</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Début</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_reservations?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Aucune réservation pour le moment
                  </td>
                </tr>
              )}
              {data?.recent_reservations?.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700">{r.user?.name}</td>
                  <td className="px-5 py-3 text-gray-700">{r.space?.name}</td>
                  <td className="px-5 py-3 text-gray-500">{r.start_at}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                      r.status === 'pending'   ? 'bg-yellow-50 text-yellow-700' :
                                                 'bg-red-50 text-red-700'
                    }`}>
                      {r.status === 'confirmed' ? 'Confirmée' :
                       r.status === 'pending'   ? 'En attente' : 'Annulée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}