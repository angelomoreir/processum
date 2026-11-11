import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

type StatusOrcamento = 'rascunho' | 'enviado' | 'aceite' | 'rejeitado' | 'expirado'
type StatusRetainer = 'ativo' | 'esgotado' | 'cancelado'

interface ItemOrcamento {
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_total: number
}

interface Orcamento {
  id: string
  numero: string
  cliente_id: string
  processo_id?: string
  titulo: string
  descricao: string
  itens: ItemOrcamento[]
  valor_total: number
  validade_dias: number
  data_emissao: string
  data_validade: string
  status: StatusOrcamento
  notas?: string
  created_at: string
  updated_at: string
}

interface Retainer {
  id: string
  cliente_id: string
  tipo: 'mensal' | 'trimestral' | 'anual' | 'por_hora'
  valor_total: number
  horas_incluidas?: number
  horas_consumidas: number
  data_inicio: string
  data_fim: string
  status: StatusRetainer
  alerta_80: boolean
  alerta_100: boolean
  faturas: string[]
  created_at: string
}

interface OrcamentosState {
  orcamentos: Orcamento[]
  retainers: Retainer[]

  fetchAll: () => Promise<void>
  criarOrcamento: (orcamento: Omit<Orcamento, 'id' | 'numero' | 'created_at' | 'updated_at' | 'status'>) => void
  atualizarOrcamento: (id: string, dados: Partial<Orcamento>) => void
  enviarOrcamento: (id: string) => void
  aceitarOrcamento: (id: string) => void
  rejeitarOrcamento: (id: string) => void
  
  criarRetainer: (retainer: Omit<Retainer, 'id' | 'created_at' | 'horas_consumidas' | 'alerta_80' | 'alerta_100' | 'faturas' | 'status'>) => void
  consumirRetainer: (id: string, horas: number) => void
  recarregarRetainer: (id: string, valor: number) => void
  
  getOrcamentosByCliente: (cliente_id: string) => Orcamento[]
  getRetainersByCliente: (cliente_id: string) => Retainer[]
  getRetainersAtivos: () => Retainer[]
  getRetainersEsgotados: () => Retainer[]
  
  verificarRetainers: () => void
}

const MOCK_ORCAMENTOS: Orcamento[] = [
  {
    id: '1',
    numero: 'ORC-2024-001',
    cliente_id: '1',
    processo_id: '1',
    titulo: 'Prestação de Serviços Jurídicos',
    descricao: 'Representação em processo de responsabilidade civil',
    itens: [
      { descricao: 'Honorários de advogado', quantidade: 20, valor_unitario: 150, valor_total: 3000 },
      { descricao: 'Custas judiciais', quantidade: 1, valor_unitario: 500, valor_total: 500 },
    ],
    valor_total: 3500,
    validade_dias: 15,
    data_emissao: '2024-01-15',
    data_validade: '2024-01-30',
    status: 'aceite',
    created_at: '2024-01-15',
    updated_at: '2024-01-20',
  },
]

const MOCK_RETAINERS: Retainer[] = [
  {
    id: '1',
    cliente_id: '2',
    tipo: 'mensal',
    valor_total: 5000,
    horas_incluidas: 30,
    horas_consumidas: 12,
    data_inicio: '2024-02-01',
    data_fim: '2024-02-29',
    status: 'ativo',
    alerta_80: false,
    alerta_100: false,
    faturas: [],
    created_at: '2024-02-01',
  },
]

export const useOrcamentosStore = create<OrcamentosState>()(
  persist(
    (set, get) => ({
      orcamentos: MOCK_ORCAMENTOS,
      retainers: MOCK_RETAINERS,

      fetchAll: async () => {
        const [orcamentos, retainers] = await Promise.all([
          fetchOrSeed<Orcamento>('/orcamentos', 'orcamentos', get().orcamentos),
          fetchOrSeed<Retainer>('/retainers', 'retainers', get().retainers),
        ])
        set({ orcamentos, retainers })
      },

      criarOrcamento: (orcamentoData) => {
        const ano = new Date().getFullYear()
        const numero = `ORC-${ano}-${String(get().orcamentos.length + 1).padStart(3, '0')}`

        const novo: Orcamento = {
          ...orcamentoData,
          id: crypto.randomUUID(),
          numero,
          status: 'rascunho',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({ orcamentos: [...state.orcamentos, novo] }))
        api.post('/orcamentos', novo).catch((e) => console.error(e))
      },

      atualizarOrcamento: (id, dados) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          orcamentos: state.orcamentos.map((o) =>
            o.id === id ? { ...o, ...dados, updated_at } : o
          ),
        }))
        api.put(`/orcamentos/${id}`, { ...dados, updated_at }).catch((e) => console.error(e))
      },

      enviarOrcamento: (id) => {
        get().atualizarOrcamento(id, { status: 'enviado' })
      },

      aceitarOrcamento: (id) => {
        get().atualizarOrcamento(id, { status: 'aceite' })
      },

      rejeitarOrcamento: (id) => {
        get().atualizarOrcamento(id, { status: 'rejeitado' })
      },

      criarRetainer: (retainerData) => {
        const novo: Retainer = {
          ...retainerData,
          id: crypto.randomUUID(),
          horas_consumidas: 0,
          alerta_80: false,
          alerta_100: false,
          faturas: [],
          status: 'ativo',
          created_at: new Date().toISOString(),
        }
        set((state) => ({ retainers: [...state.retainers, novo] }))
        api.post('/retainers', novo).catch((e) => console.error(e))
      },

      consumirRetainer: (id, horas) => {
        set((state) => ({
          retainers: state.retainers.map((r) => {
            if (r.id !== id) return r
            const novasHoras = r.horas_consumidas + horas
            const percentagem = r.horas_incluidas ? (novasHoras / r.horas_incluidas) * 100 : 0

            const atualizado = {
              ...r,
              horas_consumidas: novasHoras,
              alerta_80: percentagem >= 80 && percentagem < 100,
              alerta_100: percentagem >= 100,
              status: (percentagem >= 100 ? 'esgotado' : r.status) as StatusRetainer,
            }
            api.put(`/retainers/${id}`, {
              horas_consumidas: atualizado.horas_consumidas,
              alerta_80: atualizado.alerta_80,
              alerta_100: atualizado.alerta_100,
              status: atualizado.status,
            }).catch((e) => console.error(e))
            return atualizado
          }),
        }))
      },

      recarregarRetainer: (id, valor) => {
        set((state) => ({
          retainers: state.retainers.map((r) => {
            if (r.id !== id) return r
            const atualizado = { ...r, valor_total: r.valor_total + valor, status: 'ativo' as StatusRetainer }
            api.put(`/retainers/${id}`, {
              valor_total: atualizado.valor_total,
              status: atualizado.status,
            }).catch((e) => console.error(e))
            return atualizado
          }),
        }))
      },

      getOrcamentosByCliente: (cliente_id) => {
        return get().orcamentos.filter((o) => o.cliente_id === cliente_id)
      },

      getRetainersByCliente: (cliente_id) => {
        return get().retainers.filter((r) => r.cliente_id === cliente_id)
      },

      getRetainersAtivos: () => {
        return get().retainers.filter((r) => r.status === 'ativo')
      },

      getRetainersEsgotados: () => {
        return get().retainers.filter((r) => r.status === 'esgotado')
      },

      verificarRetainers: () => {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        set((state) => ({
          retainers: state.retainers.map((r) => {
            const dataFim = new Date(r.data_fim)
            dataFim.setHours(0, 0, 0, 0)
            if (dataFim < hoje && r.status === 'ativo') {
              return { ...r, status: 'esgotado' }
            }
            return r
          }),
        }))
      },
    }),
    {
      name: 'orcamentos-storage',
    }
  )
)
