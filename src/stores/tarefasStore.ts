import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tarefa, StatusTarefa } from '../types'
import { api, fetchOrSeed } from '../lib/api'

interface TarefasState {
  tarefas: Tarefa[]
  fetchAll: () => Promise<void>
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => void
  updateTarefa: (id: string, tarefa: Partial<Tarefa>) => void
  deleteTarefa: (id: string) => void
  moverTarefa: (id: string, novoStatus: StatusTarefa) => void
  getTarefasByProcesso: (processoId: string) => Tarefa[]
  getTarefasByResponsavel: (responsavelId: string) => Tarefa[]
  getTarefasAtrasadas: () => Tarefa[]
}

const MOCK_TAREFAS: Tarefa[] = [
  {
    id: '1',
    titulo: 'Elaborar contestação',
    descricao: 'Preparar contestação para o processo de indemnização',
    processo_id: '1',
    responsavel_id: '1',
    status: 'em_progresso',
    prioridade: 'alta',
    data_limite: '2024-01-20',
    etiquetas: ['urgente', 'civil'],
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
  {
    id: '2',
    titulo: 'Reunião com cliente',
    descricao: 'Discutir estratégia do processo',
    processo_id: '1',
    responsavel_id: '2',
    status: 'pendente',
    prioridade: 'media',
    data_limite: '2024-01-18',
    etiquetas: ['reunião'],
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
  },
  {
    id: '3',
    titulo: 'Analisar documentação',
    descricao: 'Revisar contratos enviados',
    processo_id: '2',
    responsavel_id: '1',
    status: 'concluida',
    prioridade: 'baixa',
    data_limite: '2024-01-15',
    etiquetas: ['análise'],
    created_at: '2024-01-05',
    updated_at: '2024-01-12',
  },
]

export const useTarefasStore = create<TarefasState>()(
  persist(
    (set, get) => ({
      tarefas: MOCK_TAREFAS,

      fetchAll: async () => {
        const rows = await fetchOrSeed<Tarefa>('/tarefas', 'tarefas', get().tarefas)
        set({ tarefas: rows })
      },

      addTarefa: (tarefaData) => {
        const now = new Date().toISOString()
        const newTarefa: Tarefa = {
          ...tarefaData,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }
        set((state) => ({
          tarefas: [...state.tarefas, newTarefa],
        }))
        api.post('/tarefas', newTarefa).catch((e) => console.error(e))
      },

      updateTarefa: (id, tarefaData) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, ...tarefaData, updated_at } : t
          ),
        }))
        api.put(`/tarefas/${id}`, { ...tarefaData, updated_at }).catch((e) => console.error(e))
      },

      deleteTarefa: (id) => {
        set((state) => ({
          tarefas: state.tarefas.filter((t) => t.id !== id),
        }))
        api.del(`/tarefas/${id}`).catch((e) => console.error(e))
      },

      moverTarefa: (id, novoStatus) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, status: novoStatus, updated_at } : t
          ),
        }))
        api.put(`/tarefas/${id}`, { status: novoStatus, updated_at }).catch((e) => console.error(e))
      },

      getTarefasByProcesso: (processoId) => {
        return get().tarefas.filter((t) => t.processo_id === processoId)
      },

      getTarefasByResponsavel: (responsavelId) => {
        return get().tarefas.filter((t) => t.responsavel_id === responsavelId)
      },

      getTarefasAtrasadas: () => {
        const hoje = new Date().toISOString().split('T')[0]
        return get().tarefas.filter(
          (t) =>
            !!t.data_limite &&
            t.data_limite < hoje &&
            t.status !== 'concluida' &&
            t.status !== 'arquivada'
        )
      },
    }),
    {
      name: 'tarefas-storage',
    }
  )
)
