import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  criterio: string
  pontos: number
  conquistado: boolean
  data_conquista?: string
}

interface Objectivo {
  id: string
  nome: string
  descricao: string
  tipo: 'horas' | 'faturas' | 'clientes' | 'processos'
  meta: number
  atual: number
  unidade: string
  prazo: string // mensal, trimestral, anual
  completado: boolean
  recompensa_pontos: number
}

interface GamificacaoState {
  pontos_total: number
  nivel: number
  badges: Badge[]
  objectivos: Objectivo[]
  ranking: { usuario_id: string; nome: string; pontos: number }[]
  
  // Ações
  adicionarPontos: (pontos: number) => void
  verificarBadges: (horas?: number, faturas?: number, clientes?: number, processos?: number) => void
  atualizarObjectivo: (tipo: string, valor: number) => void
  getProgressoNivel: () => number
  getProximoNivel: () => number
}

const BADGES_PADRAO: Badge[] = [
  {
    id: '1',
    nome: 'Primeiros Passos',
    descricao: 'Registrou as primeiras 10 horas',
    icone: '🎯',
    criterio: '10 horas',
    pontos: 100,
    conquistado: false,
  },
  {
    id: '2',
    nome: 'Advogado Produtivo',
    descricao: 'Registrou 100 horas no total',
    icone: '⚡',
    criterio: '100 horas',
    pontos: 500,
    conquistado: false,
  },
  {
    id: '3',
    nome: 'Colecionador de Casos',
    descricao: 'Abriu 10 processos',
    icone: '📁',
    criterio: '10 processos',
    pontos: 300,
    conquistado: false,
  },
  {
    id: '4',
    nome: 'Rei da Faturação',
    descricao: 'Emitiu 5 faturas',
    icone: '💰',
    criterio: '5 faturas',
    pontos: 250,
    conquistado: false,
  },
  {
    id: '5',
    nome: 'Networking Master',
    descricao: 'Importou 5 contactos do LinkedIn',
    icone: '🔗',
    criterio: '5 linkedin',
    pontos: 200,
    conquistado: false,
  },
  {
    id: '6',
    nome: 'Assinatura Digital',
    descricao: 'Assinou primeiro documento digitalmente',
    icone: '✍️',
    criterio: '1 assinatura',
    pontos: 150,
    conquistado: false,
  },
  {
    id: '7',
    nome: 'Cidadão do Ano',
    descricao: '100 horas num único mês',
    icone: '🏆',
    criterio: '100 horas/mês',
    pontos: 1000,
    conquistado: false,
  },
  {
    id: '8',
    nome: 'Sem Prazos Perdidos',
    descricao: 'Concluiu 20 prazos sem atrasos',
    icone: '⏰',
    criterio: '20 prazos',
    pontos: 400,
    conquistado: false,
  },
]

const OBJECTIVOS_PADRAO: Objectivo[] = [
  {
    id: '1',
    nome: 'Meta Mensal de Horas',
    descricao: 'Trabalhar 120 horas este mês',
    tipo: 'horas',
    meta: 120,
    atual: 0,
    unidade: 'horas',
    prazo: 'mensal',
    completado: false,
    recompensa_pontos: 500,
  },
  {
    id: '2',
    nome: 'Faturação do Mês',
    descricao: 'Faturar 5000€ este mês',
    tipo: 'faturas',
    meta: 5000,
    atual: 0,
    unidade: '€',
    prazo: 'mensal',
    completado: false,
    recompensa_pontos: 1000,
  },
  {
    id: '3',
    nome: 'Novos Clientes',
    descricao: 'Converter 3 leads em clientes',
    tipo: 'clientes',
    meta: 3,
    atual: 0,
    unidade: 'clientes',
    prazo: 'trimestral',
    completado: false,
    recompensa_pontos: 750,
  },
]

const RANKING_MOCK = [
  { usuario_id: '1', nome: 'Dr. João Silva', pontos: 3250 },
  { usuario_id: '2', nome: 'Dra. Maria Santos', pontos: 2890 },
  { usuario_id: '3', nome: 'Dr. Pedro Almeida', pontos: 2450 },
]

export const useGamificacaoStore = create<GamificacaoState>()(
  persist(
    (set, get) => ({
      pontos_total: 0,
      nivel: 1,
      badges: BADGES_PADRAO,
      objectivos: OBJECTIVOS_PADRAO,
      ranking: RANKING_MOCK,

      adicionarPontos: (pontos) => {
        set((state) => {
          const novosPontos = state.pontos_total + pontos
          const novoNivel = Math.floor(novosPontos / 1000) + 1
          return {
            pontos_total: novosPontos,
            nivel: novoNivel,
          }
        })
      },

      verificarBadges: (horas = 0, faturas = 0, clientes = 0, processos = 0) => {
        set((state) => {
          let novosPontos = 0
          const badgesAtualizados = state.badges.map((badge) => {
            if (badge.conquistado) return badge

            let conquistado = false
            switch (badge.criterio) {
              case '10 horas':
                conquistado = horas >= 10
                break
              case '100 horas':
                conquistado = horas >= 100
                break
              case '10 processos':
                conquistado = processos >= 10
                break
              case '5 faturas':
                conquistado = faturas >= 5
                break
              case '5 linkedin':
                conquistado = clientes >= 5 // Simplificado
                break
            }

            if (conquistado) {
              novosPontos += badge.pontos
              return { ...badge, conquistado: true, data_conquista: new Date().toISOString() }
            }
            return badge
          })

          const novosPontosTotal = state.pontos_total + novosPontos
          return {
            badges: badgesAtualizados,
            pontos_total: novosPontosTotal,
            nivel: Math.floor(novosPontosTotal / 1000) + 1,
          }
        })
      },

      atualizarObjectivo: (tipo, valor) => {
        set((state) => {
          let pontosGanhos = 0
          const objectivosAtualizados = state.objectivos.map((obj) => {
            if (obj.tipo !== tipo || obj.completado) return obj

            const novoAtual = obj.atual + valor
            if (novoAtual >= obj.meta && !obj.completado) {
              pontosGanhos += obj.recompensa_pontos
              return { ...obj, atual: novoAtual, completado: true }
            }
            return { ...obj, atual: novoAtual }
          })

          return {
            objectivos: objectivosAtualizados,
            pontos_total: state.pontos_total + pontosGanhos,
          }
        })
      },

      getProgressoNivel: () => {
        return (get().pontos_total % 1000) / 1000
      },

      getProximoNivel: () => {
        return (get().nivel + 1) * 1000
      },
    }),
    {
      name: 'gamificacao-storage',
    }
  )
)
