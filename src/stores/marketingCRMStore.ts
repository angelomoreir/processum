import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

type StatusCampanha = 'rascunho' | 'agendada' | 'enviada' | 'concluida'
type TipoCampanha = 'email' | 'newsletter' | 'sms' | 'whatsapp'

interface Campanha {
  id: string
  nome: string
  tipo: TipoCampanha
  assunto: string
  conteudo: string
  segmento: string[]
  agendamento?: string
  status: StatusCampanha
  estatisticas: {
    enviados: number
    abertos: number
    cliques: number
    respostas: number
  }
  created_at: string
}

interface NPS {
  id: string
  cliente_id: string
  processo_id?: string
  nota: number // 0-10
  comentario?: string
  data: string
  responded: boolean
}

interface Referral {
  id: string
  indicador_id: string
  indicado_nome: string
  indicado_email: string
  indicado_telefone?: string
  status: 'novo' | 'contactado' | 'convertido' | 'descartado'
  recompensa?: number
  data: string
}

interface MarketingCRMState {
  campanhas: Campanha[]
  npsResponses: NPS[]
  referrals: Referral[]

  fetchAll: () => Promise<void>
  criarCampanha: (campanha: Omit<Campanha, 'id' | 'status' | 'estatisticas' | 'created_at'>) => void
  enviarCampanha: (id: string) => void
  
  enviarNPS: (cliente_id: string, processo_id?: string) => void
  responderNPS: (id: string, nota: number, comentario?: string) => void
  getNPSByCliente: (cliente_id: string) => NPS[]
  getNPSMedia: () => number
  
  addReferral: (referral: Omit<Referral, 'id' | 'status' | 'data'>) => void
  atualizarReferral: (id: string, status: Referral['status']) => void
  getReferralsByIndicador: (indicador_id: string) => Referral[]
}

const MOCK_CAMPANHAS: Campanha[] = [
  {
    id: '1',
    nome: 'Newsletter Janeiro 2024',
    tipo: 'newsletter',
    assunto: 'Novidades Jurídicas - Janeiro 2024',
    conteudo: 'Confira as atualizações legislativas mais importantes...',
    segmento: ['todos'],
    status: 'concluida',
    estatisticas: { enviados: 150, abertos: 89, cliques: 45, respostas: 12 },
    created_at: '2024-01-15',
  },
]

const MOCK_NPS: NPS[] = [
  { id: '1', cliente_id: '1', nota: 9, comentario: 'Excelente atendimento!', data: '2024-02-01', responded: true },
  { id: '2', cliente_id: '2', nota: 7, data: '2024-02-02', responded: true },
]

const MOCK_REFERRALS: Referral[] = [
  {
    id: '1',
    indicador_id: '1',
    indicado_nome: 'Carlos Ferreira',
    indicado_email: 'carlos@email.pt',
    status: 'convertido',
    recompensa: 100,
    data: '2024-01-20',
  },
]

export const useMarketingCRMStore = create<MarketingCRMState>()(
  persist(
    (set, get) => ({
      campanhas: MOCK_CAMPANHAS,
      npsResponses: MOCK_NPS,
      referrals: MOCK_REFERRALS,

      fetchAll: async () => {
        const [campanhas, npsResponses, referrals] = await Promise.all([
          fetchOrSeed<Campanha>('/marketing_campanhas', 'marketing_campanhas', get().campanhas),
          fetchOrSeed<NPS>('/marketing_nps', 'marketing_nps', get().npsResponses),
          fetchOrSeed<Referral>('/marketing_referrals', 'marketing_referrals', get().referrals),
        ])
        set({ campanhas, npsResponses, referrals })
      },

      criarCampanha: (campanhaData) => {
        const nova: Campanha = {
          ...campanhaData,
          id: crypto.randomUUID(),
          status: 'rascunho',
          estatisticas: { enviados: 0, abertos: 0, cliques: 0, respostas: 0 },
          created_at: new Date().toISOString(),
        }
        set((state) => ({ campanhas: [...state.campanhas, nova] }))
        api.post('/marketing_campanhas', nova).catch((e) => console.error(e))
      },

      enviarCampanha: (id) => {
        set((state) => ({
          campanhas: state.campanhas.map((c) => {
            if (c.id !== id) return c
            const dados = {
              status: 'concluida' as StatusCampanha,
              estatisticas: {
                enviados: Math.floor(Math.random() * 200) + 50,
                abertos: Math.floor(Math.random() * 100) + 20,
                cliques: Math.floor(Math.random() * 50) + 10,
                respostas: Math.floor(Math.random() * 20) + 5,
              },
            }
            api.put(`/marketing_campanhas/${id}`, dados).catch((e) => console.error(e))
            return { ...c, ...dados }
          }),
        }))
      },

      enviarNPS: (cliente_id, processo_id) => {
        const nps: NPS = {
          id: crypto.randomUUID(),
          cliente_id,
          processo_id,
          nota: 0,
          data: new Date().toISOString(),
          responded: false,
        }
        set((state) => ({ npsResponses: [...state.npsResponses, nps] }))
        api.post('/marketing_nps', nps).catch((e) => console.error(e))
      },

      responderNPS: (id, nota, comentario) => {
        set((state) => ({
          npsResponses: state.npsResponses.map((n) =>
            n.id === id ? { ...n, nota, comentario, responded: true } : n
          ),
        }))
        api.put(`/marketing_nps/${id}`, { nota, comentario, responded: true }).catch((e) => console.error(e))
      },

      getNPSByCliente: (cliente_id) => {
        return get().npsResponses.filter((n) => n.cliente_id === cliente_id)
      },

      getNPSMedia: () => {
        const respondidos = get().npsResponses.filter((n) => n.responded)
        if (respondidos.length === 0) return 0
        return respondidos.reduce((acc, n) => acc + n.nota, 0) / respondidos.length
      },

      addReferral: (referralData) => {
        const novo: Referral = {
          ...referralData,
          id: crypto.randomUUID(),
          status: 'novo',
          data: new Date().toISOString(),
        }
        set((state) => ({ referrals: [...state.referrals, novo] }))
        api.post('/marketing_referrals', novo).catch((e) => console.error(e))
      },

      atualizarReferral: (id, status) => {
        set((state) => ({
          referrals: state.referrals.map((r) => {
            if (r.id !== id) return r
            const dados = { status, recompensa: status === 'convertido' ? 100 : r.recompensa }
            api.put(`/marketing_referrals/${id}`, dados).catch((e) => console.error(e))
            return { ...r, ...dados }
          }),
        }))
      },

      getReferralsByIndicador: (indicador_id) => {
        return get().referrals.filter((r) => r.indicador_id === indicador_id)
      },
    }),
    {
      name: 'marketing-crm-storage',
    }
  )
)
