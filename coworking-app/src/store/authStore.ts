import { create } from 'zustand'
import api from '../lib/axios'

interface User {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  role: string
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/api/login', { email, password })
      const { data } = await api.get('/api/me')
      set({ user: data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    await api.post('/api/logout')
    set({ user: null })
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/api/me')
      set({ user: data.user })
    } catch {
      set({ user: null })
    }
  },
}))