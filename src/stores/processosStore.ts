import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Processo, Cliente, Usuario } from '../types'
import { useClientesStore } from './clientesStore'
import { useAuthStore } from './authStore'
import { useEquipaStore } from './equipaStore'
import { api, fetchOrSeed } from '../lib/api'

interface ProcessosState {
  processos: Processo[]
  fetchAll: () => Promise<void>
  addProcesso: (processo: Omit<Processo, 'id' | 'created_at' | 'updated_at' | 'cliente' | 'advogado_responsavel'>) => void
  updateProcesso: (id: string, processo: Partial<Processo>) => void
  deleteProcesso: (id: string) => void
  getProcessoById: (id: string) => Processo | undefined
}

export function enriquecerProcesso(
  p: Processo,
  clientes: Cliente[],
  usuarios: Usuario[]
): Processo {
  return {
    ...p,
    cliente: p.cliente ?? clientes.find((c) => c.id === p.cliente_id),
    advogado_responsavel:
      p.advogado_responsavel ?? usuarios.find((u) => u.id === p.advogado_responsavel_id),
  }
}

const MOCK_PROCESSOS: Processo[] = [
  {
    id: '1',
    numero: '12345/2024',
    descricao: 'Ação de Indemnização',
    cliente_id: '2',
    advogado_responsavel_id: '1',
    status: 'ativo',
    area_direito: 'Civil',
    tribunal: 'Tribunal Judicial de Lisboa',
    data_abertura: '2024-01-15',
    valor_causa: 50000,
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
  },
  {
    id: '2',
    numero: '23456/2024',
    descricao: 'Processo Trabalhista',
    cliente_id: '1',
    advogado_responsavel_id: '2',
    status: 'ativo',
    area_direito: 'Trabalho',
    tribunal: 'Tribunal do Trabalho de Lisboa',
    data_abertura: '2024-02-01',
    valor_causa: 25000,
    created_at: '2024-02-01',
    updated_at: '2024-02-01',
  },
  {
    id: '3',
    numero: '34567/2024',
    descricao: 'Ação de Família',
    cliente_id: '3',
    advogado_responsavel_id: '1',
    status: 'ativo',
    area_direito: 'Família',
    tribunal: 'Tribunal de Família e Menores de Lisboa',
    data_abertura: '2024-03-10',
    valor_causa: 0,
    created_at: '2024-03-10',
    updated_at: '2024-03-10',
  },
]

export const useProcessosStore = create<ProcessosState>()(
  persist(
    (set, get) => ({
      processos: MOCK_PROCESSOS,

      fetchAll: async () => {
        const rows = await fetchOrSeed<Processo>('/processos', 'processos', get().processos)
        const clientes = useClientesStore.getState().clientes
        const usuarios = useEquipaStore.getState().membros
        set({ processos: rows.map((p) => enriquecerProcesso(p, clientes, usuarios)) })
      },

      addProcesso: (processoData) => {
        const clientes = useClientesStore.getState().clientes
        const cliente = clientes.find((c) => c.id === processoData.cliente_id)
        const utilizadorAtual = useAuthStore.getState().user

        const now = new Date().toISOString()
        const newProcesso: Processo = {
          ...processoData,
          id: crypto.randomUUID(),
          cliente,
          advogado_responsavel: utilizadorAtual ?? undefined,
          created_at: now,
          updated_at: now,
        }
        set((state) => ({
          processos: [...state.processos, newProcesso],
        }))
        const { cliente: _c, advogado_responsavel: _a, ...row } = newProcesso
        void _c
        void _a
        api.post('/processos', row).catch((e) => console.error(e))
      },

      updateProcesso: (id, processoData) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          processos: state.processos.map((p) =>
            p.id === id ? { ...p, ...processoData, updated_at } : p
          ),
        }))
        const { cliente: _c, advogado_responsavel: _a, ...row } = processoData
        void _c
        void _a
        api.put(`/processos/${id}`, { ...row, updated_at }).catch((e) => console.error(e))
      },

      deleteProcesso: (id) => {
        set((state) => ({
          processos: state.processos.filter((p) => p.id !== id),
        }))
        api.del(`/processos/${id}`).catch((e) => console.error(e))
      },

      getProcessoById: (id) => {
        return get().processos.find((p) => p.id === id)
      },
    }),
    {
      name: 'processos-storage',
    }
  )
)
