import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'

interface Equipment {
  id: number
  name: string
  quantity: number
}

interface Space {
  id: number
  name: string
  description: string
  capacity: number
  price_per_hour: number
  location: string
  status: string
  equipments: (Equipment & { pivot?: { quantity: number } })[]
  is_currently_reserved: boolean
  active_reservation: { end_at: string; user_name: string } | null
  next_reservation: { start_at: string; end_at: string } | null
}

export default function SpacesPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Space | null>(null)
  type SelectedEquipment = { id: number; name: string; quantity: number }
const [selectedEquipments, setSelectedEquipments] = useState<SelectedEquipment[]>([])
  const [form, setForm] = useState({
    name: '', description: '', capacity: '',
    price_per_hour: '', location: '', status: 'available',
  })

  const { data: spaces, isLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const res = await api.get('/api/spaces')
      const result = res.data
      return (Array.isArray(result) ? result : result.data) as Space[]
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  const { data: allEquipments } = useQuery({
    queryKey: ['equipments'],
    queryFn: async () => {
      const res = await api.get('/api/equipments')
      const result = res.data
      return (Array.isArray(result) ? result : result.data) as Equipment[]
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/api/spaces', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: any) =>
      api.put(`/api/spaces/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/spaces/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  })

  const resetForm = () => {
    setForm({
      name: '', description: '', capacity: '',
      price_per_hour: '', location: '', status: 'available',
    })
    setSelectedEquipments([])
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (space: Space) => {
    setEditing(space)
    setForm({
      name: space.name,
      description: space.description,
      capacity: String(space.capacity),
      price_per_hour: String(space.price_per_hour),
      location: space.location,
      status: space.status,
    })
    setSelectedEquipments(
      space.equipments.map(eq => ({
        id: eq.id,
        name: eq.name,
        quantity: eq.pivot?.quantity ?? 1,
      }))
    )
    setShowForm(true)
  }

  const handleAddEquipment = (eq: Equipment) => {
    if (selectedEquipments.find(e => e.id === eq.id)) return
    setSelectedEquipments([
      ...selectedEquipments,
      { id: eq.id, name: eq.name, quantity: 1 },
    ])
  }

  const handleRemoveEquipment = (id: number) => {
    setSelectedEquipments(selectedEquipments.filter(e => e.id !== id))
  }

  const handleEquipmentQuantity = (id: number, quantity: number) => {
    setSelectedEquipments(
      selectedEquipments.map(e =>
        e.id === id ? { ...e, quantity } : e
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      price_per_hour: Number(form.price_per_hour),
      equipments: selectedEquipments.map(e => ({
        id: e.id,
        quantity: e.quantity,
      })),
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const getAvailabilityBadge = (space: Space) => {
    if (space.status === 'maintenance') {
      return {
        label: 'Maintenance',
        color: 'bg-yellow-500',
        dot: 'bg-yellow-400',
      }
    }
    if (space.status === 'unavailable') {
      return {
        label: 'Indisponible',
        color: 'bg-gray-500',
        dot: 'bg-gray-400',
      }
    }
    if (space.is_currently_reserved) {
      return {
        label: 'Réservé',
        color: 'bg-red-500',
        dot: 'bg-red-400',
      }
    }
    return {
      label: 'Disponible',
      color: 'bg-green-500',
      dot: 'bg-green-400',
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Espaces</h2>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des espaces de coworking
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nouvel espace
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {editing ? "Modifier l'espace" : 'Nouvel espace'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Localisation
                </label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Capacité
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Prix/heure (FCFA)
                </label>
                <input
                  type="number"
                  value={form.price_per_hour}
                  onChange={e =>
                    setForm({ ...form, price_per_hour: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Statut
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Disponible</option>
                  <option value="unavailable">Indisponible</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sélection des équipements */}
            <div className="border border-gray-100 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Équipements de cet espace
              </p>

              {/* Équipements sélectionnés */}
              {selectedEquipments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {selectedEquipments.map(eq => (
                    <div
                      key={eq.id}
                      className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-blue-700 flex-1">
                        {eq.name}
                      </span>
                      <span className="text-xs text-blue-500">Qté :</span>
                      <input
                        type="number"
                        value={eq.quantity}
                        min={1}
                        onChange={e =>
                          handleEquipmentQuantity(eq.id, Number(e.target.value))
                        }
                        className="w-16 border border-blue-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(eq.id)}
                        className="text-red-400 hover:text-red-600 text-sm ml-1"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Ajouter un équipement */}
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Cliquez pour ajouter :
                </p>
                <div className="flex flex-wrap gap-2">
                  {allEquipments
                    ?.filter(
                      eq => !selectedEquipments.find(e => e.id === eq.id)
                    )
                    .map(eq => (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => handleAddEquipment(eq)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        + {eq.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {editing ? 'Modifier' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Annuler
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {spaces?.map(space => {
            const badge = getAvailabilityBadge(space)
            return (
              <div
                key={space.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3"
              >
                {/* En-tête avec badge disponibilité */}
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-800">{space.name}</h3>
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`}
                    />
                    {badge.label}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {space.description}
                </p>

                {/* Info réservation en cours */}
                {space.is_currently_reserved && space.active_reservation && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                    Réservé jusqu'au {space.active_reservation.end_at}
                    {space.active_reservation.user_name && (
                      <span className="text-red-400">
                        {' '}par {space.active_reservation.user_name}
                      </span>
                    )}
                  </div>
                )}

                {/* Prochaine réservation */}
                {!space.is_currently_reserved && space.next_reservation && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 text-xs text-yellow-700">
                    Prochaine réservation : {space.next_reservation.start_at}
                  </div>
                )}

                {/* Infos */}
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                  <span>Capacité : {space.capacity} pers.</span>
                  <span className="text-right font-medium text-gray-600">
                    {Number(space.price_per_hour).toLocaleString()} FCFA/h
                  </span>
                  <span className="col-span-2">{space.location}</span>
                </div>

                {/* Équipements */}
                {space.equipments && space.equipments.length > 0 && (
                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Équipements :</p>
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

                {/* Actions admin */}
                {isAdmin && (
                  <div className="flex gap-2 pt-1 border-t border-gray-50">
                    <button
                      onClick={() => handleEdit(space)}
                      className="flex-1 text-center text-sm text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(space.id)}
                      className="flex-1 text-center text-sm text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}