import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PrevisaoProcesso {
  processo_id: string
  probabilidade_ganho: number // 0-100
  valor_provavel: number
  tempo_estimado_dias: number
  fatores_positivos: string[]
  fatores_negativos: string[]
  confianca: number // 0-100
  atualizado_em: string
}

interface PrevisaoFinanceira {
  mes: number
  ano: number
  receita_prevista: number
  receita_minima: number
  receita_maxima: number
  despesas_previstas: number
  lucro_previsto: number
  confianca: number
}

interface AnaliseRisco {
  cliente_id: string
  risco_fuga: number // 0-100
  motivos: string[]
  recomendacoes: string[]
}

interface AnalisePreditivaState {
  previsoesProcessos: PrevisaoProcesso[]
  previsoesFinanceiras: PrevisaoFinanceira[]
  analisesRisco: AnaliseRisco[]
  
  calcularProbabilidadeGanho: (processo_id: string) => PrevisaoProcesso
  preverReceitas: (mes: number, ano: number) => PrevisaoFinanceira
  analisarRiscoCliente: (cliente_id: string) => AnaliseRisco
  
  getPrevisaoByProcesso: (processo_id: string) => PrevisaoProcesso | undefined
  getTendenciaFinanceira: (meses: number) => PrevisaoFinanceira[]
}

const MOCK_PREVISOES_PROCESSOS: PrevisaoProcesso[] = [
  {
    processo_id: '1',
    probabilidade_ganho: 75,
    valor_provavel: 18500,
    tempo_estimado_dias: 180,
    fatores_positivos: ['Documentação completa', 'Testemunhas credíveis', 'Precedentes favoráveis'],
    fatores_negativos: ['Adversário com recursos ilimitados', 'Complexidade probatória'],
    confianca: 82,
    atualizado_em: '2024-02-01',
  },
  {
    processo_id: '2',
    probabilidade_ganho: 45,
    valor_provavel: 8000,
    tempo_estimado_dias: 365,
    fatores_positivos: ['Direito claro'],
    fatores_negativos: ['Falta de provas documentais', 'Adversário com boa defesa'],
    confianca: 65,
    atualizado_em: '2024-02-01',
  },
]

export const useAnalisePreditivaStore = create<AnalisePreditivaState>()(
  persist(
    (set, get) => ({
      previsoesProcessos: MOCK_PREVISOES_PROCESSOS,
      previsoesFinanceiras: [],
      analisesRisco: [],

      calcularProbabilidadeGanho: (processo_id) => {
        // Simula cálculo ML
        const mock = MOCK_PREVISOES_PROCESSOS.find((p) => p.processo_id === processo_id)
        if (mock) return mock

        const novaPrevisao: PrevisaoProcesso = {
          processo_id,
          probabilidade_ganho: Math.round(50 + Math.random() * 30),
          valor_provavel: Math.round(10000 + Math.random() * 20000),
          tempo_estimado_dias: Math.round(180 + Math.random() * 180),
          fatores_positivos: ['Análise preliminar favorável'],
          fatores_negativos: ['Dados insuficientes'],
          confianca: Math.round(50 + Math.random() * 30),
          atualizado_em: new Date().toISOString(),
        }
        
        set((state) => ({
          previsoesProcessos: [...state.previsoesProcessos, novaPrevisao],
        }))
        
        return novaPrevisao
      },

      preverReceitas: (mes, ano) => {
        const baseReceita = 15000
        const variacao = (Math.random() - 0.5) * 5000
        
        const previsto: PrevisaoFinanceira = {
          mes,
          ano,
          receita_prevista: Math.round(baseReceita + variacao),
          receita_minima: Math.round(baseReceita + variacao - 3000),
          receita_maxima: Math.round(baseReceita + variacao + 5000),
          despesas_previstas: 8000,
          lucro_previsto: Math.round(baseReceita + variacao - 8000),
          confianca: 75,
        }
        
        set((state) => ({
          previsoesFinanceiras: [...state.previsoesFinanceiras, previsto],
        }))
        
        return previsto
      },

      analisarRiscoCliente: (cliente_id) => {
        const risco = Math.round(20 + Math.random() * 40)
        
        const analise: AnaliseRisco = {
          cliente_id,
          risco_fuga: risco,
          motivos: risco > 50 ? ['Pouca comunicação', 'Demora em respostas'] : ['Boa relação'],
          recomendacoes: ['Manter contacto regular', 'Enviar atualizações mensais'],
        }
        
        set((state) => ({
          analisesRisco: [...state.analisesRisco, analise],
        }))
        
        return analise
      },

      getPrevisaoByProcesso: (processo_id) => {
        return get().previsoesProcessos.find((p) => p.processo_id === processo_id)
      },

      getTendenciaFinanceira: (meses) => {
        return get().previsoesFinanceiras.slice(-meses)
      },
    }),
    {
      name: 'analise-preditiva-storage',
    }
  )
)
