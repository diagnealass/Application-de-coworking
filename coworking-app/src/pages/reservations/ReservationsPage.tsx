import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'

interface Space {
  id: number
  name: string
  price_per_hour: number
}

interface Reservation {
  id: number
  user: { name: string }
  space: { name: string }
  start_at: string
  end_at: string
  status: string
  total_price: number
  notes: string
}

export default function ReservationsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    space_id: '',
    start_at: '',
    end_at: '',
    notes: '',
  })

  const { data: reservations, isLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const response = await api.get('/api/reservations')
      console.log('Réponse réservations :', response.data)
      const result = response.data
      if (Array.isArray(result)) return result as Reservation[]
      if (Array.isArray(result.data)) return result.data as Reservation[]
      return [] as Reservation[]
    },
  })

  const { data: spaces } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const response = await api.get('/api/spaces')
      const result = response.data
      if (Array.isArray(result)) return result as Space[]
      if (Array.isArray(result.data)) return result.data as Space[]
      return [] as Space[]
    },
  })

  const createMutation = useMutation({
    mutationFn: (formData: any) => api.post('/api/reservations', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      setForm({ space_id: '', start_at: '', end_at: '', notes: '' })
      setShowForm(false)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/api/reservations/${id}`, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/reservations/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      space_id: Number(form.space_id),
    })
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending:   { label: 'En attente', color: 'bg-yellow-50 text-yellow-700' },
    confirmed: { label: 'Confirmée',  color: 'bg-green-50 text-green-700'   },
    cancelled: { label: 'Annulée',    color: 'bg-red-50 text-red-700'       },
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
        Erreur de chargement. Vérifiez que Laravel est démarré.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Réservations</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Toutes les réservations' : 'Vos réservations'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nouvelle réservation
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            Nouvelle réservation
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Espace</label>
              <select
                value={form.space_id}
                onChange={e => setForm({ ...form, space_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un espace</option>
                {spaces?.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.name} — {Number(space.price_per_hour).toLocaleString()} FCFA/h
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Début</label>
              <input
                type="datetime-local"
                value={form.start_at}
                onChange={e => setForm({ ...form, start_at: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={e => setForm({ ...form, end_at: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Erreur création */}
            {createMutation.isError && (
              <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {(createMutation.error as any)?.response?.data?.message ||
                  'Erreur lors de la réservation'}
              </div>
            )}

            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Création...' : 'Réserver'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setForm({ space_id: '', start_at: '', end_at: '', notes: '' })
                }}
                className="bg-gray-100 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {isAdmin && (
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">
                    Membre
                  </th>
                )}
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Espace
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Début
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Fin
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Prix
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Statut
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(!reservations || reservations.length === 0) && (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="text-center py-8 text-gray-400"
                  >
                    Aucune réservation pour le moment
                  </td>
                </tr>
              )}
              {reservations?.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {isAdmin && (
                    <td className="px-5 py-3 text-gray-700">
                      {r.user?.name}
                    </td>
                  )}
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {r.space?.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{r.start_at}</td>
                  <td className="px-5 py-3 text-gray-500">{r.end_at}</td>
                  <td className="px-5 py-3 text-gray-700">
                    {Number(r.total_price).toLocaleString()} FCFA
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusLabel[r.status]?.color
                      }`}
                    >
                      {statusLabel[r.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      {isAdmin && r.status === 'pending' && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: r.id,
                              status: 'confirmed',
                            })
                          }
                          className="text-green-600 hover:underline text-sm"
                        >
                          Confirmer
                        </button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelMutation.mutate(r.id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}