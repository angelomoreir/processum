import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, PerfilUsuario } from '../types'
import { api, setToken, getToken } from '../lib/api'

interface AuthState {
  user: Usuario | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (dados: {
    email: string
    nome: string
    password: string
    firmName?: string
  }) => Promise<{ ok: boolean; erro?: string }>
  logout: () => void
  hasPermission: (perfis: PerfilUsuario[]) => boolean
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,

      login: async (email: string, password: string) => {
        try {
          const res = await api.post<{ token: string; user: Usuario }>('/auth/login', {
            email,
            password,
          })
          setToken(res.token)
          set({ user: res.user })
          return true
        } catch {
          return false
        }
      },

      register: async (dados) => {
        try {
          const res = await api.post<{ token: string; user: Usuario }>(
            '/auth/register',
            dados
          )
          setToken(res.token)
          set({ user: res.user })
          return { ok: true }
        } catch (e) {
          return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao registar' }
        }
      },

      logout: () => {
        setToken(null)
        set({ user: null })
      },

      hasPermission: (perfis: PerfilUsuario[]) => {
        const { user } = get()
        if (!user) return false
        return perfis.includes(user.perfil)
      },

      checkSession: async () => {
        if (!getToken()) {
          set({ user: null })
          return
        }
        try {
          const user = await api.get<Usuario>('/auth/me')
          set({ user })
        } catch {
          setToken(null)
          set({ user: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
