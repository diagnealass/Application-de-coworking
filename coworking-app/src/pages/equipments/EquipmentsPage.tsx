import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'

interface Equipment {
  id: number
  name: string
  description: string
  quantity: number
  status: string
}

export default function EquipmentsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', quantity: '', status: 'available',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['equipments'],
    queryFn: async () => {
      const response = await api.get('/api/equipments')
      console.log('Réponse équipements :', response.data)
      const result = response.data
      if (Array.isArray(result)) return result as Equipment[]
      if (Array.isArray(result.data)) return result.data as Equipment[]
      return [] as Equipment[]
    },
  })

  const createMutation = useMutation({
    mutationFn: (formData: any) => api.post('/api/equipments', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...formData }: any) =>
      api.put(`/api/equipments/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/equipments/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['equipments'] }),
  })

  const resetForm = () => {
    setForm({ name: '', description: '', quantity: '', status: 'available' })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (equipment: Equipment) => {
    setEditing(equipment)
    setForm({
      name: equipment.name,
      description: equipment.description,
      quantity: String(equipment.quantity),
      status: equipment.status,
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, quantity: Number(form.quantity) }
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    available:   { label: 'Disponible',   color: 'bg-green-50 text-green-700'   },
    unavailable: { label: 'Indisponible', color: 'bg-red-50 text-red-700'       },
    maintenance: { label: 'Maintenance',  color: 'bg-yellow-50 text-yellow-700' },
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
          <h2 className="text-2xl font-semibold text-gray-800">Équipements</h2>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des équipements disponibles
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nouvel équipement
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {editing ? "Modifier l'équipement" : 'Nouvel équipement'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm text-gray-600 mb-1">Quantité</label>
              <input
                type="number"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Statut</label>
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
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Description</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Quantité</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                {isAdmin && (
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {(!data || data.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Aucun équipement trouvé
                  </td>
                </tr>
              )}
              {data?.map((equipment) => (
                <tr
                  key={equipment.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {equipment.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {equipment.description || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {equipment.quantity}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabel[equipment.status]?.color}`}>
                      {statusLabel[equipment.status]?.label}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(equipment)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(equipment.id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}