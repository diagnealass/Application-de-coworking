import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../lib/axios'

interface Equipment {
  id: number
  name: string
  pivot?: { quantity: number }
}

interface Space {
  id: number
  name: string
  description: string
  capacity: number
  price_per_hour: number
  location: string
  status: string
  equipments: Equipment[]
  is_currently_reserved: boolean
  active_reservation: { end_at: string } | null
  next_reservation: { start_at: string; end_at: string } | null
}

export default function MemberSpaces() {
  const queryClient = useQueryClient()
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [form, setForm] = useState({ start_at: '', end_at: '', notes: '' })
  const [success, setSuccess] = useState('')

  const { data: spaces, isLoading } = useQuery({
    queryKey: ['member-spaces'],
    queryFn: async () => {
      const res = await api.get('/api/spaces')
      const result = res.data
      return (Array.isArray(result) ? result : result.data) as Space[]
    },
    refetchInterval: 30000,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/reservations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['member-spaces'] })
      setSelectedSpace(null)
      setForm({ start_at: '', end_at: '', notes: '' })
      setSuccess(
        'Réservation créée ! Rendez-vous dans "Mes réservations" pour payer.'
      )
      setTimeout(() => setSuccess(''), 5000)
    },
  })

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      space_id: selectedSpace?.id,
      ...form,
    })
  }

  const getAvailabilityBadge = (space: Space) => {
    if (space.status === 'maintenance') {
      return { label: 'Maintenance',  color: 'bg-yellow-500', canBook: false }
    }
    if (space.status === 'unavailable') {
      return { label: 'Indisponible', color: 'bg-gray-400',   canBook: false }
    }
    if (space.is_currently_reserved) {
      return { label: 'Réservé',      color: 'bg-red-500',    canBook: false }
    }
    return { label: 'Disponible',     color: 'bg-green-500',  canBook: true  }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Réserver un espace
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Choisissez l'espace qui vous convient
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Formulaire de réservation */}
      {selectedSpace && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium text-blue-800">
                Réserver : {selectedSpace.name}
              </h3>
              <p className="text-sm text-blue-600 mt-0.5">
                {Number(selectedSpace.price_per_hour).toLocaleString()} FCFA/h
              </p>
            </div>
            <button
              onClick={() => setSelectedSpace(null)}
              className="text-blue-400 hover:text-blue-600 text-sm"
            >
              Annuler
            </button>
          </div>

          <form onSubmit={handleReserve} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-blue-700 mb-1">Début</label>
              <input
                type="datetime-local"
                value={form.start_at}
                onChange={e => setForm({ ...form, start_at: e.target.value })}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-blue-700 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={e => setForm({ ...form, end_at: e.target.value })}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-blue-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                rows={2}
              />
            </div>

            {createMutation.isError && (
              <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {(createMutation.error as any)?.response?.data?.message ||
                  'Erreur lors de la réservation'}
              </div>
            )}

            <div className="col-span-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending
                  ? 'Réservation...'
                  : 'Confirmer la réservation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des espaces */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {spaces?.map(space => {
            const badge = getAvailabilityBadge(space)
            return (
              <div
                key={space.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3"
              >
                {/* En-tête avec badge */}
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-800">{space.name}</h3>
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-pulse" />
                    {badge.label}
                  </span>
                </div>

                <p className="text-sm text-gray-500">{space.description}</p>

                {/* Réservation en cours */}
                {space.is_currently_reserved && space.active_reservation && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                    Occupé jusqu'au {space.active_reservation.end_at}
                  </div>
                )}

                {/* Prochaine réservation */}
                {!space.is_currently_reserved && space.next_reservation && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 text-xs text-yellow-700">
                    Prochain créneau occupé à partir du{' '}
                    {space.next_reservation.start_at}
                  </div>
                )}

                {/* Infos */}
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                  <span>Capacité : {space.capacity} personnes</span>
                  <span className="text-right font-medium text-gray-600">
                    {Number(space.price_per_hour).toLocaleString()} FCFA/h
                  </span>
                  <span className="col-span-2">{space.location}</span>
                </div>

                {/* Équipements */}
                {space.equipments && space.equipments.length > 0 && (
                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-xs text-gray-400 mb-2">
                      Équipements inclus :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {space.equipments.map(eq => (
                        <span
                          key={eq.id}
                          className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100"
                        >
                          {eq.name}
                          {eq.pivot?.quantity && eq.pivot.quantity > 1
                            ? ` x${eq.pivot.quantity}`
                            : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton réserver */}
                <div className="pt-2 border-t border-gray-50">
                  <button
                    onClick={() => badge.canBook && setSelectedSpace(space)}
                    disabled={!badge.canBook}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      badge.canBook
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {badge.canBook ? 'Réserver cet espace' : badge.label}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}