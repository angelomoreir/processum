import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, PerfilUsuario } from '../types'
import { api } from '../lib/api'

interface Convite {
  id: string
  email: string
  perfil: PerfilUsuario
  status: 'pendente' | 'aceite'
  token?: string
  created_at?: string
}

interface EquipaState {
  membros: Usuario[]
  convites: Convite[]
  fetchAll: () => Promise<void>
  adicionarMembro: (membro: Usuario) => void
  removerMembro: (id: string) => void
  convidarMembro: (email: string, perfil: PerfilUsuario) => void
  cancelarConvite: (id: string) => void
}

export const useEquipaStore = create<EquipaState>()(
  persist(
    (set) => ({
      membros: [],
      convites: [],

      fetchAll: async () => {
        try {
          const [membros, convites] = await Promise.all([
            api.get<Usuario[]>('/usuarios'),
            api.get<Convite[]>('/convites'),
          ])
          set({ membros, convites })
        } catch (e) {
          console.error('equipa fetchAll:', e)
        }
      },

      adicionarMembro: (membro) =>
        set((state) => ({ membros: [...state.membros, membro] })),

      removerMembro: (id) => {
        set((state) => ({ membros: state.membros.filter(m => m.id !== id) }))
        api.del(`/usuarios/${id}`).catch((e) => console.error(e))
      },

      convidarMembro: (email, perfil) => {
        api
          .post<Convite>('/convites/gerar', { email, perfil })
          .then((convite) =>
            set((state) => ({ convites: [...state.convites, convite] }))
          )
          .catch((e) => console.error(e))
      },

      cancelarConvite: (id) => {
        set((state) => ({ convites: state.convites.filter(c => c.id !== id) }))
        api.del(`/convites/${id}`).catch((e) => console.error(e))
      },
    }),
    {
      name: 'equipa-storage',
    }
  )
)
