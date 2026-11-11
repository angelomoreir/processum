import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RegistroHora } from '../types'
import { api, fetchOrSeed } from '../lib/api'

interface HorasState {
  horas: RegistroHora[]
  fetchAll: () => Promise<void>
  addHora: (hora: Omit<RegistroHora, 'id' | 'created_at' | 'advogado' | 'processo'>) => void
  updateHora: (id: string, hora: Partial<RegistroHora>) => void
  deleteHora: (id: string) => void
  getHorasByProcesso: (processoId: string) => RegistroHora[]
  getTotalFaturado: () => number
}

const MOCK_HORAS: RegistroHora[] = [
  {
    id: '1',
    processo_id: '1',
    advogado_id: '1',
    data: new Date().toISOString(),
    atividade: 'Análise de documentos',
    duracao_minutos: 120,
    faturavel: true,
    valor_hora: 150,
    notas: 'Revisão de contratos',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    processo_id: '2',
    advogado_id: '2',
    data: new Date().toISOString(),
    atividade: 'Reunião com cliente',
    duracao_minutos: 60,
    faturavel: true,
    valor_hora: 150,
    notas: 'Discussão estratégica',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    processo_id: '1',
    advogado_id: '1',
    data: new Date().toISOString(),
    atividade: 'Elaboração de petição',
    duracao_minutos: 180,
    faturavel: true,
    valor_hora: 150,
    notas: 'Contestação',
    created_at: new Date().toISOString(),
  },
]

export const useHorasStore = create<HorasState>()(
  persist(
    (set, get) => ({
      horas: MOCK_HORAS,

      fetchAll: async () => {
        const rows = await fetchOrSeed<RegistroHora>('/horas', 'horas', get().horas)
        set({ horas: rows })
      },

      addHora: (horaData) => {
        const now = new Date().toISOString()
        const newHora: RegistroHora = {
          ...horaData,
          id: crypto.randomUUID(),
          created_at: now,
        }
        set((state) => ({
          horas: [...state.horas, newHora],
        }))
        api.post('/horas', newHora).catch((e) => console.error(e))
      },

      updateHora: (id, horaData) => {
        set((state) => ({
          horas: state.horas.map((h) =>
            h.id === id ? { ...h, ...horaData } : h
          ),
        }))
        const { processo: _p, advogado: _a, ...row } = horaData
        void _p
        void _a
        api.put(`/horas/${id}`, row).catch((e) => console.error(e))
      },

      deleteHora: (id) => {
        set((state) => ({
          horas: state.horas.filter((h) => h.id !== id),
        }))
        api.del(`/horas/${id}`).catch((e) => console.error(e))
      },

      getHorasByProcesso: (processoId) => {
        return get().horas.filter((h) => h.processo_id === processoId)
      },

      getTotalFaturado: () => {
        return get().horas
          .filter((h) => h.faturavel)
          .reduce((acc, h) => acc + (h.duracao_minutos / 60) * (h.valor_hora || 0), 0)
      },
    }),
    {
      name: 'horas-storage',
    }
  )
)
