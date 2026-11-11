import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

interface Parte {
  id: string
  nome: string
  nif?: string
  tipo: 'pessoa' | 'empresa'
  contato?: {
    email?: string
    telefone?: string
  }
  notas?: string
  alerta_conflito: boolean
}

interface Relacao {
  id: string
  parte_a_id: string
  parte_b_id: string
  tipo: 'adversario' | 'cliente' | 'colaborador' | 'familiar'
  processo_id?: string
  data_relacao: string
}

interface ConflitoDetectado {
  id: string
  tipo: 'cliente_adversario' | 'interesse_conflitante' | 'confidencialidade'
  severidade: 'alta' | 'media' | 'baixa'
  descricao: string
  partes_envolvidas: string[]
  processo_id?: string
  status: 'pendente' | 'analise' | 'resolvido' | 'impedido'
  data_detecao: string
  resolucao?: string
}

interface ConflitosState {
  partes: Parte[]
  relacoes: Relacao[]
  conflitos: ConflitoDetectado[]

  fetchAll: () => Promise<void>
  addParte: (parte: Omit<Parte, 'id' | 'alerta_conflito'>) => void
  addRelacao: (relacao: Omit<Relacao, 'id'>) => void

  verificarConflito: (parte_id: string, processo_id?: string) => ConflitoDetectado[]
  detectarConflitos: () => void

  getParteById: (id: string) => Parte | undefined
  getPartesByProcesso: (processo_id: string) => Parte[]
  getRelacoesByParte: (parte_id: string) => Relacao[]
  getArvoreRelacoes: (parte_id: string, profundidade?: number, visitados?: Set<string>) => { parte: Parte; relacao: string; profundidade: number }[]
}

const MOCK_PARTES: Parte[] = [
  { id: '1', nome: 'João Ferreira', nif: '123456789', tipo: 'pessoa', alerta_conflito: false },
  { id: '2', nome: 'Empresa ABC, Lda.', nif: '501234567', tipo: 'empresa', alerta_conflito: false },
  { id: '3', nome: 'Seguradora XPTO, SA', nif: '502345678', tipo: 'empresa', alerta_conflito: true },
  { id: '4', nome: 'Maria Santos', nif: '987654321', tipo: 'pessoa', alerta_conflito: false },
  { id: '5', nome: 'Construtora Alfa, Lda.', nif: '503456789', tipo: 'empresa', alerta_conflito: false },
]

const MOCK_RELACOES: Relacao[] = [
  { id: '1', parte_a_id: '1', parte_b_id: '3', tipo: 'adversario', processo_id: '1', data_relacao: '2024-01-15' },
  { id: '2', parte_a_id: '2', parte_b_id: '5', tipo: 'colaborador', data_relacao: '2023-06-01' },
]

export const useConflitosStore = create<ConflitosState>()(
  persist(
    (set, get) => ({
      partes: MOCK_PARTES,
      relacoes: MOCK_RELACOES,
      conflitos: [],

      fetchAll: async () => {
        const [partes, relacoes, conflitos] = await Promise.all([
          fetchOrSeed<Parte>('/conflitos_partes', 'conflitos_partes', get().partes),
          fetchOrSeed<Relacao>('/conflitos_relacoes', 'conflitos_relacoes', get().relacoes),
          fetchOrSeed<ConflitoDetectado>('/conflitos_detectados', 'conflitos_detectados', get().conflitos),
        ])
        set({ partes, relacoes, conflitos })
      },

      addParte: (parteData) => {
        const novaParte: Parte = {
          ...parteData,
          id: crypto.randomUUID(),
          alerta_conflito: false,
        }
        set((state) => ({ partes: [...state.partes, novaParte] }))
        api.post('/conflitos_partes', novaParte).catch((e) => console.error(e))
      },

      addRelacao: (relacaoData) => {
        const novaRelacao: Relacao = {
          ...relacaoData,
          id: crypto.randomUUID(),
        }
        set((state) => ({ relacoes: [...state.relacoes, novaRelacao] }))
        api.post('/conflitos_relacoes', novaRelacao).catch((e) => console.error(e))
      },

      verificarConflito: (parte_id, processo_id) => {
        const conflitosDetectados: ConflitoDetectado[] = []
        const relacoes = get().getRelacoesByParte(parte_id)
        
        // Verifica se parte já foi adversária de cliente atual
        relacoes.forEach((rel) => {
          if (rel.tipo === 'adversario') {
            conflitosDetectados.push({
              id: crypto.randomUUID(),
              tipo: 'cliente_adversario',
              severidade: 'alta',
              descricao: `Parte já foi adversária em processo anterior`,
              partes_envolvidas: [rel.parte_a_id, rel.parte_b_id],
              processo_id,
              status: 'pendente',
              data_detecao: new Date().toISOString(),
            })
          }
        })
        
        return conflitosDetectados
      },

      detectarConflitos: () => {
        const conflitos: ConflitoDetectado[] = []
        
        // Analisa todas as relações para conflitos
        get().relacoes.forEach((rel) => {
          if (rel.tipo === 'adversario') {
            conflitos.push({
              id: crypto.randomUUID(),
              tipo: 'cliente_adversario',
              severidade: 'alta',
              descricao: `Relação adversarial detectada`,
              partes_envolvidas: [rel.parte_a_id, rel.parte_b_id],
              processo_id: rel.processo_id,
              status: 'pendente',
              data_detecao: new Date().toISOString(),
            })
          }
        })
        
        set({ conflitos })
        conflitos.forEach((c) =>
          api.post('/conflitos_detectados', c).catch((e) => console.error(e))
        )
      },

      getParteById: (id) => {
        return get().partes.find((p) => p.id === id)
      },

      getPartesByProcesso: (processo_id) => {
        const relacoes = get().relacoes.filter((r) => r.processo_id === processo_id)
        const parteIds = new Set<string>()
        relacoes.forEach((r) => {
          parteIds.add(r.parte_a_id)
          parteIds.add(r.parte_b_id)
        })
        return get().partes.filter((p) => parteIds.has(p.id))
      },

      getRelacoesByParte: (parte_id) => {
        return get().relacoes.filter(
          (r) => r.parte_a_id === parte_id || r.parte_b_id === parte_id
        )
      },

      getArvoreRelacoes: (parte_id, profundidade = 0, visitados = new Set<string>()) => {
        if (profundidade > 3 || visitados.has(parte_id)) return []
        
        visitados.add(parte_id)
        const parte = get().getParteById(parte_id)
        if (!parte) return []
        
        const arvore: { parte: Parte; relacao: string; profundidade: number }[] = []
        const relacoes = get().getRelacoesByParte(parte_id)
        
        relacoes.forEach((rel) => {
          const outraParteId = rel.parte_a_id === parte_id ? rel.parte_b_id : rel.parte_a_id
          const outraParte = get().getParteById(outraParteId)
          if (outraParte) {
            arvore.push({ parte: outraParte, relacao: rel.tipo, profundidade })
            arvore.push(...get().getArvoreRelacoes(outraParteId, profundidade + 1, visitados))
          }
        })
        
        return arvore
      },
    }),
    {
      name: 'conflitos-storage',
    }
  )
)
