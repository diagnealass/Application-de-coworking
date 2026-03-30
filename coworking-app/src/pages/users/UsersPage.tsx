import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'
import { Navigate } from 'react-router-dom'

interface User {
  id: number
  name: string
  email: string
  phone: string
  company: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    company: '', password: '', role: 'member',
  })

  // Rediriger si pas admin
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/api/users')
      const result = response.data
      if (Array.isArray(result)) return result as User[]
      if (Array.isArray(result.data)) return result.data as User[]
      return [] as User[]
    },
  })

  const createMutation = useMutation({
    mutationFn: (formData: any) => api.post('/api/users', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...formData }: any) =>
      api.put(`/api/users/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/users/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', company: '', password: '', role: 'member' })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (user: User) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      company: user.company || '',
      password: '',
      role: user.role,
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const payload: any = {
        id: editing.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        role: form.role,
      }
      if (form.password) payload.password = form.password
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(form)
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
        Erreur de chargement des utilisateurs.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Utilisateurs</h2>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des membres et administrateurs
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {editing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
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
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Entreprise</label>
              <input
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editing}
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rôle</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {(createMutation.error as any)?.response?.data?.message ||
                 (updateMutation.error as any)?.response?.data?.message ||
                 'Une erreur est survenue'}
              </div>
            )}

            <div className="col-span-2 flex gap-3 pt-2">
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
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Téléphone</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Entreprise</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Rôle</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Inscrit le</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!data || data.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
              {data?.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {u.name}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-blue-500">(vous)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{u.company || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.created_at}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(u)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Modifier
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => deleteMutation.mutate(u.id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Supprimer
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