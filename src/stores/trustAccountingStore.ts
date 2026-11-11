import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

interface ContaCliente {
  id: string
  cliente_id: string
  saldo: number
  moeda: string
  status: 'ativa' | 'bloqueada' | 'encerrada'
  created_at: string
}

interface MovimentacaoTrust {
  id: string
  conta_id: string
  tipo: 'deposito' | 'levantamento' | 'transferencia' | 'honorarios' | 'custas' | 'reembolso'
  valor: number
  descricao: string
  processo_id?: string
  fatura_id?: string
  referencia?: string
  data_movimentacao: string
  saldo_apos: number
  created_by: string
}

interface Reconciliacao {
  id: string
  data: string
  saldo_sistema: number
  saldo_bancario: number
  diferenca: number
  justificacao?: string
  status: 'pendente' | 'reconciliado'
}

interface TrustAccountingState {
  contas: ContaCliente[]
  movimentacoes: MovimentacaoTrust[]
  reconciliacoes: Reconciliacao[]

  fetchAll: () => Promise<void>
  criarConta: (cliente_id: string) => void
  depositar: (conta_id: string, valor: number, descricao: string, created_by: string) => void
  levantar: (conta_id: string, valor: number, descricao: string, created_by: string) => boolean
  transferir: (origem_id: string, destino_id: string, valor: number, descricao: string, created_by: string) => boolean
  
  getContaByCliente: (cliente_id: string) => ContaCliente | undefined
  getMovimentacoesByConta: (conta_id: string) => MovimentacaoTrust[]
  getSaldoTotal: () => number
  
  reconciliar: (data: string, saldo_bancario: number, justificacao?: string) => void
  gerarRelatorioMensal: (mes: number, ano: number) => {
    entradas: number
    saidas: number
    saldo_inicial: number
    saldo_final: number
  }
}

const MOCK_CONTAS: ContaCliente[] = [
  { id: '1', cliente_id: '1', saldo: 2500, moeda: 'EUR', status: 'ativa', created_at: '2024-01-15' },
  { id: '2', cliente_id: '2', saldo: 5000, moeda: 'EUR', status: 'ativa', created_at: '2024-02-01' },
]

const MOCK_MOVIMENTACOES: MovimentacaoTrust[] = [
  {
    id: '1',
    conta_id: '1',
    tipo: 'deposito',
    valor: 3000,
    descricao: 'Adiantamento para processo',
    processo_id: '1',
    data_movimentacao: '2024-01-15',
    saldo_apos: 3000,
    created_by: '1',
  },
  {
    id: '2',
    conta_id: '1',
    tipo: 'custas',
    valor: 500,
    descricao: 'Pagamento de custas judiciais',
    processo_id: '1',
    data_movimentacao: '2024-01-20',
    saldo_apos: 2500,
    created_by: '1',
  },
]

export const useTrustAccountingStore = create<TrustAccountingState>()(
  persist(
    (set, get) => ({
      contas: MOCK_CONTAS,
      movimentacoes: MOCK_MOVIMENTACOES,
      reconciliacoes: [],

      fetchAll: async () => {
        const [contas, movimentacoes, reconciliacoes] = await Promise.all([
          fetchOrSeed<ContaCliente>('/trust_contas', 'trust_contas', get().contas),
          fetchOrSeed<MovimentacaoTrust>('/trust_movimentacoes', 'trust_movimentacoes', get().movimentacoes),
          fetchOrSeed<Reconciliacao>('/trust_reconciliacoes', 'trust_reconciliacoes', get().reconciliacoes),
        ])
        set({ contas, movimentacoes, reconciliacoes })
      },

      criarConta: (cliente_id) => {
        const novaConta: ContaCliente = {
          id: crypto.randomUUID(),
          cliente_id,
          saldo: 0,
          moeda: 'EUR',
          status: 'ativa',
          created_at: new Date().toISOString(),
        }
        set((state) => ({ contas: [...state.contas, novaConta] }))
        api.post('/trust_contas', novaConta).catch((e) => console.error(e))
      },

      depositar: (conta_id, valor, descricao, created_by) => {
        const conta = get().contas.find((c) => c.id === conta_id)
        if (!conta || conta.status !== 'ativa') return

        const novoSaldo = conta.saldo + valor

        const movimentacao: MovimentacaoTrust = {
          id: crypto.randomUUID(),
          conta_id,
          tipo: 'deposito',
          valor,
          descricao,
          data_movimentacao: new Date().toISOString(),
          saldo_apos: novoSaldo,
          created_by,
        }

        set((state) => ({
          contas: state.contas.map((c) =>
            c.id === conta_id ? { ...c, saldo: novoSaldo } : c
          ),
          movimentacoes: [...state.movimentacoes, movimentacao],
        }))
        api
          .post('/trust/deposito', { conta_id, valor, descricao })
          .catch((e) => console.error(e))
      },

      levantar: (conta_id, valor, descricao, created_by) => {
        const conta = get().contas.find((c) => c.id === conta_id)
        if (!conta || conta.status !== 'ativa' || conta.saldo < valor) return false

        const novoSaldo = conta.saldo - valor

        const movimentacao: MovimentacaoTrust = {
          id: crypto.randomUUID(),
          conta_id,
          tipo: 'levantamento',
          valor: -valor,
          descricao,
          data_movimentacao: new Date().toISOString(),
          saldo_apos: novoSaldo,
          created_by,
        }

        set((state) => ({
          contas: state.contas.map((c) =>
            c.id === conta_id ? { ...c, saldo: novoSaldo } : c
          ),
          movimentacoes: [...state.movimentacoes, movimentacao],
        }))
        api
          .post('/trust/levantamento', { conta_id, valor, descricao })
          .catch((e) => console.error(e))

        return true
      },

      transferir: (origem_id, destino_id, valor, descricao, created_by) => {
        const origem = get().contas.find((c) => c.id === origem_id)
        const destino = get().contas.find((c) => c.id === destino_id)

        if (!origem || !destino || origem.saldo < valor) return false

        const now = new Date().toISOString()
        const saldoOrigem = origem.saldo - valor
        const saldoDestino = destino.saldo + valor
        const movSaida: MovimentacaoTrust = {
          id: crypto.randomUUID(),
          conta_id: origem_id,
          tipo: 'transferencia',
          valor: -valor,
          descricao: `Transferência para conta ${destino_id}: ${descricao}`,
          data_movimentacao: now,
          saldo_apos: saldoOrigem,
          created_by,
        }
        const movEntrada: MovimentacaoTrust = {
          id: crypto.randomUUID(),
          conta_id: destino_id,
          tipo: 'transferencia',
          valor,
          descricao: `Transferência da conta ${origem_id}: ${descricao}`,
          data_movimentacao: now,
          saldo_apos: saldoDestino,
          created_by,
        }

        set((state) => ({
          contas: state.contas.map((c) =>
            c.id === origem_id
              ? { ...c, saldo: saldoOrigem }
              : c.id === destino_id
                ? { ...c, saldo: saldoDestino }
                : c
          ),
          movimentacoes: [...state.movimentacoes, movSaida, movEntrada],
        }))
        api
          .post('/trust/transferencia', { origem_id, destino_id, valor, descricao })
          .catch((e) => console.error(e))

        return true
      },

      getContaByCliente: (cliente_id) => {
        return get().contas.find((c) => c.cliente_id === cliente_id)
      },

      getMovimentacoesByConta: (conta_id) => {
        return get().movimentacoes
          .filter((m) => m.conta_id === conta_id)
          .sort((a, b) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime())
      },

      getSaldoTotal: () => {
        return get().contas.reduce((acc, c) => acc + c.saldo, 0)
      },

      reconciliar: (data, saldo_bancario, justificacao) => {
        const saldo_sistema = get().getSaldoTotal()
        const reconciliacao: Reconciliacao = {
          id: crypto.randomUUID(),
          data,
          saldo_sistema,
          saldo_bancario,
          diferenca: saldo_bancario - saldo_sistema,
          justificacao,
          status: Math.abs(saldo_bancario - saldo_sistema) < 0.01 ? 'reconciliado' : 'pendente',
        }
        set((state) => ({ reconciliacoes: [...state.reconciliacoes, reconciliacao] }))
        api.post('/trust_reconciliacoes', reconciliacao).catch((e) => console.error(e))
      },

      gerarRelatorioMensal: (mes, ano) => {
        const movimentacoesMes = get().movimentacoes.filter((m) => {
          const data = new Date(m.data_movimentacao)
          return data.getMonth() === mes - 1 && data.getFullYear() === ano
        })

        const entradas = movimentacoesMes
          .filter((m) => m.valor > 0)
          .reduce((acc, m) => acc + m.valor, 0)
        
        const saidas = movimentacoesMes
          .filter((m) => m.valor < 0)
          .reduce((acc, m) => acc + Math.abs(m.valor), 0)

        const saldo_inicial = get().contas.reduce((acc, c) => acc + c.saldo, 0) - entradas + saidas

        return {
          entradas,
          saidas,
          saldo_inicial,
          saldo_final: saldo_inicial + entradas - saidas,
        }
      },
    }),
    {
      name: 'trust-accounting-storage',
    }
  )
)
