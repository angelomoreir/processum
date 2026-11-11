import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Fatura, Despesa, RelatorioFinanceiro } from '../types'
import { api, fetchOrSeed } from '../lib/api'

interface FinanceiroState {
  faturas: Fatura[]
  despesas: Despesa[]
  fetchAll: () => Promise<void>
  addFatura: (fatura: Omit<Fatura, 'id' | 'created_at' | 'updated_at' | 'numero'>) => void
  updateFatura: (id: string, fatura: Partial<Fatura>) => void
  deleteFatura: (id: string) => void
  addDespesa: (despesa: Omit<Despesa, 'id' | 'created_at'>) => void
  getFaturasPendentes: () => Fatura[]
  getReceitaTotal: (mes?: number, ano?: number) => number
  getDespesaTotal: (mes?: number, ano?: number) => number
  getRelatorioMensal: (mes: number, ano: number) => RelatorioFinanceiro
}

const MOCK_FATURAS: Fatura[] = [
  {
    id: '1',
    numero: 'FT-2024-001',
    cliente_id: '1',
    processo_id: '1',
    valor_total: 2500,
    valor_iva: 575,
    valor_liquido: 1925,
    data_emissao: '2024-01-15',
    data_vencimento: '2024-02-15',
    status: 'paga',
    itens: [
      { descricao: 'Consultoria jurídica', quantidade: 10, valor_unitario: 150, valor_total: 1500 },
      { descricao: 'Elaboração de petição', quantidade: 1, valor_unitario: 1000, valor_total: 1000 },
    ],
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
  },
  {
    id: '2',
    numero: 'FT-2024-002',
    cliente_id: '2',
    processo_id: '2',
    valor_total: 1800,
    valor_iva: 414,
    valor_liquido: 1386,
    data_emissao: '2024-02-01',
    data_vencimento: '2024-03-01',
    status: 'pendente',
    itens: [
      { descricao: 'Horas trabalhadas', quantidade: 12, valor_unitario: 150, valor_total: 1800 },
    ],
    created_at: '2024-02-01',
    updated_at: '2024-02-01',
  },
]

const MOCK_DESPESAS: Despesa[] = [
  {
    id: '1',
    descricao: 'Aluguer escritório',
    categoria: 'fixa',
    valor: 1500,
    data: '2024-01-01',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    descricao: 'Salários',
    categoria: 'pessoal',
    valor: 5000,
    data: '2024-01-01',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    descricao: 'Material de escritório',
    categoria: 'operacional',
    valor: 200,
    data: '2024-01-15',
    created_at: '2024-01-15',
  },
]

export const useFinanceiroStore = create<FinanceiroState>()(
  persist(
    (set, get) => ({
      faturas: MOCK_FATURAS,
      despesas: MOCK_DESPESAS,

      fetchAll: async () => {
        const [faturas, despesas] = await Promise.all([
          fetchOrSeed<Fatura>('/faturas', 'faturas', get().faturas),
          fetchOrSeed<Despesa>('/despesas', 'despesas', get().despesas),
        ])
        set({ faturas, despesas })
      },

      addFatura: (faturaData) => {
        const now = new Date().toISOString()
        const ano = new Date().getFullYear()
        const numeroFatura = `FT-${ano}-${String(get().faturas.length + 1).padStart(3, '0')}`

        const newFatura: Fatura = {
          ...faturaData,
          id: crypto.randomUUID(),
          numero: numeroFatura,
          created_at: now,
          updated_at: now,
        }
        set((state) => ({
          faturas: [...state.faturas, newFatura],
        }))
        api.post('/faturas', newFatura).catch((e) => console.error(e))
      },

      updateFatura: (id, faturaData) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          faturas: state.faturas.map((f) =>
            f.id === id ? { ...f, ...faturaData, updated_at } : f
          ),
        }))
        api.put(`/faturas/${id}`, { ...faturaData, updated_at }).catch((e) => console.error(e))
      },

      deleteFatura: (id) => {
        set((state) => ({
          faturas: state.faturas.filter((f) => f.id !== id),
        }))
        api.del(`/faturas/${id}`).catch((e) => console.error(e))
      },

      addDespesa: (despesaData) => {
        const newDespesa: Despesa = {
          ...despesaData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        set((state) => ({
          despesas: [...state.despesas, newDespesa],
        }))
        api.post('/despesas', newDespesa).catch((e) => console.error(e))
      },

      getFaturasPendentes: () => {
        return get().faturas.filter((f) => f.status === 'pendente' || f.status === 'atrasada')
      },

      getReceitaTotal: (mes, ano) => {
        return get().faturas
          .filter((f) => {
            if (!mes || !ano) return f.status === 'paga'
            const data = new Date(f.data_emissao)
            return data.getMonth() === mes - 1 && data.getFullYear() === ano && f.status === 'paga'
          })
          .reduce((acc, f) => acc + f.valor_liquido, 0)
      },

      getDespesaTotal: (mes, ano) => {
        return get().despesas
          .filter((d) => {
            if (!mes || !ano) return true
            const data = new Date(d.data)
            return data.getMonth() === mes - 1 && data.getFullYear() === ano
          })
          .reduce((acc, d) => acc + d.valor, 0)
      },

      getRelatorioMensal: (mes, ano) => {
        const receitas = get().getReceitaTotal(mes, ano)
        const despesas = get().getDespesaTotal(mes, ano)
        
        return {
          mes,
          ano,
          receitas,
          despesas,
          lucro: receitas - despesas,
          faturasEmitidas: get().faturas.filter((f) => {
            const data = new Date(f.data_emissao)
            return data.getMonth() === mes - 1 && data.getFullYear() === ano
          }).length,
          faturasPagas: get().faturas.filter((f) => {
            const data = new Date(f.data_emissao)
            return data.getMonth() === mes - 1 && data.getFullYear() === ano && f.status === 'paga'
          }).length,
          faturasPendentes: get().faturas.filter((f) => {
            const data = new Date(f.data_emissao)
            return data.getMonth() === mes - 1 && data.getFullYear() === ano && (f.status === 'pendente' || f.status === 'atrasada')
          }).length,
        }
      },
    }),
    {
      name: 'financeiro-storage',
    }
  )
)
