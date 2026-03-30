import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()

  const [profileForm, setProfileForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    company: user?.company || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  })

  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.put('/api/profile', data),
    onSuccess: ({ data }) => {
      setUser(data.user)
      setProfileSuccess('Profil mis à jour avec succès')
      setTimeout(() => setProfileSuccess(''), 3000)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: any) => api.put('/api/profile/password', data),
    onSuccess: () => {
      setPasswordSuccess('Mot de passe modifié avec succès')
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
      setTimeout(() => setPasswordSuccess(''), 3000)
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    profileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    passwordMutation.mutate(passwordForm)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Mon profil</h2>
        <p className="text-gray-500 text-sm mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Infos du compte */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-blue-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
              user?.role === 'admin'
                ? 'bg-purple-50 text-purple-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {user?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </span>
          </div>
        </div>

        <h3 className="text-base font-medium text-gray-800 mb-4">
          Informations personnelles
        </h3>

        {profileSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
            {profileSuccess}
          </div>
        )}

        {profileMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {(profileMutation.error as any)?.response?.data?.message ||
              'Erreur lors de la mise à jour'}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom complet</label>
            <input
              value={profileForm.name}
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
            <input
              value={profileForm.phone}
              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+221 77 000 00 00"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Entreprise</label>
            <input
              value={profileForm.company}
              onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre entreprise"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {profileMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Changement mot de passe */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-medium text-gray-800 mb-4">
          Changer le mot de passe
        </h3>

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
            {passwordSuccess}
          </div>
        )}

        {passwordMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {(passwordMutation.error as any)?.response?.data?.message ||
              'Erreur lors du changement de mot de passe'}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={e => setPasswordForm({
                ...passwordForm,
                current_password: e.target.value
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.password}
              onChange={e => setPasswordForm({
                ...passwordForm,
                password: e.target.value
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={e => setPasswordForm({
                ...passwordForm,
                password_confirmation: e.target.value
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {passwordMutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}