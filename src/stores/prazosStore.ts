import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Prazo, TipoPrazo } from '../types'
import { adicionarDiasUteis } from '../lib/utils'
import { useProcessosStore } from './processosStore'
import { api, fetchOrSeed } from '../lib/api'

interface PrazosState {
  prazos: Prazo[]
  fetchAll: () => Promise<void>
  addPrazo: (prazo: Omit<Prazo, 'id' | 'created_at' | 'updated_at' | 'processo'>) => void
  updatePrazo: (id: string, prazo: Partial<Prazo>) => void
  deletePrazo: (id: string) => void
  concluirPrazo: (id: string) => void
  getPrazosByProcesso: (processoId: string) => Prazo[]
  getPrazosUrgentes: () => Prazo[]
  getPrazosDoDia: (data: Date) => Prazo[]
}

const MOCK_PRAZOS: Prazo[] = [
  {
    id: '1',
    titulo: 'Audiência de Julgamento',
    descricao: 'Processo n.º 12345/2024',
    processo_id: '1',
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 86400000).toISOString(),
    tipo: 'audiencia',
    prioridade: 'urgente',
    concluido: false,
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    titulo: 'Prazo para Petição',
    descricao: 'Contestação',
    processo_id: '2',
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 172800000).toISOString(),
    tipo: 'peticao',
    prioridade: 'alta',
    concluido: false,
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    titulo: 'Protocolo de Documentos',
    descricao: 'Anexar provas',
    processo_id: '3',
    data_inicio: new Date().toISOString(),
    data_fim: new Date(Date.now() + 259200000).toISOString(),
    tipo: 'protocolo',
    prioridade: 'media',
    concluido: false,
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function enriquecerPrazo(p: Prazo): Prazo {
  if (p.processo) return p
  const processo = useProcessosStore.getState().processos.find((x) => x.id === p.processo_id)
  return { ...p, processo }
}

export const usePrazosStore = create<PrazosState>()(
  persist(
    (set, get) => ({
      prazos: MOCK_PRAZOS,

      fetchAll: async () => {
        const rows = await fetchOrSeed<Prazo>('/prazos', 'prazos', get().prazos)
        set({ prazos: rows.map(enriquecerPrazo) })
      },

      addPrazo: (prazoData) => {
        const now = new Date().toISOString()
        const newPrazo: Prazo = {
          ...prazoData,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }
        set((state) => ({
          prazos: [...state.prazos, enriquecerPrazo(newPrazo)],
        }))
        const { processo: _p, ...row } = newPrazo
        void _p
        api.post('/prazos', row).catch((e) => console.error(e))
      },

      updatePrazo: (id, prazoData) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          prazos: state.prazos.map((p) =>
            p.id === id ? { ...p, ...prazoData, updated_at } : p
          ),
        }))
        const { processo: _p, ...row } = prazoData
        void _p
        api.put(`/prazos/${id}`, { ...row, updated_at }).catch((e) => console.error(e))
      },

      deletePrazo: (id) => {
        set((state) => ({
          prazos: state.prazos.filter((p) => p.id !== id),
        }))
        api.del(`/prazos/${id}`).catch((e) => console.error(e))
      },

      concluirPrazo: (id) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          prazos: state.prazos.map((p) =>
            p.id === id ? { ...p, concluido: true, updated_at } : p
          ),
        }))
        api.put(`/prazos/${id}`, { concluido: true, updated_at }).catch((e) => console.error(e))
      },

      getPrazosByProcesso: (processoId) => {
        return get().prazos.filter((p) => p.processo_id === processoId)
      },

      getPrazosUrgentes: () => {
        const hoje = new Date()
        const amanha = new Date(hoje.getTime() + 86400000)
        return get().prazos.filter(
          (p) =>
            !p.concluido &&
            (p.prioridade === 'urgente' ||
              new Date(p.data_fim) <= amanha)
        )
      },

      getPrazosDoDia: (data) => {
        return get().prazos.filter((prazo) => {
          const dataPrazo = new Date(prazo.data_fim)
          return (
            dataPrazo.getDate() === data.getDate() &&
            dataPrazo.getMonth() === data.getMonth() &&
            dataPrazo.getFullYear() === data.getFullYear()
          )
        })
      },
    }),
    {
      name: 'prazos-storage',
    }
  )
)

// Função para calcular data final baseada em regras
export function calcularDataFinal(
  dataInicio: Date,
  _tipo: TipoPrazo,
  dias: number,
  diasUteis: boolean = true
): Date {
  if (diasUteis) {
    return adicionarDiasUteis(dataInicio, dias)
  }
  return new Date(dataInicio.getTime() + dias * 86400000)
}

export const REGRAS_PRAZO: Record<TipoPrazo, { dias: number; diasUteis: boolean }> = {
  audiencia: { dias: 0, diasUteis: false },
  peticao: { dias: 15, diasUteis: true },
  protocolo: { dias: 5, diasUteis: true },
  recurso: { dias: 30, diasUteis: true },
  outro: { dias: 10, diasUteis: true },
}
