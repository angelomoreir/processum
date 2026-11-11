import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

type ConsentimentoTipo = 'marketing' | 'processamento_dados' | 'partilha' | 'retencao'
type ConsentimentoStatus = 'pendente' | 'aceite' | 'recusado' | 'revogado'

interface Consentimento {
  id: string
  cliente_id: string
  tipo: ConsentimentoTipo
  status: ConsentimentoStatus
  versao: string
  data_solicitacao: string
  data_resposta?: string
  ip_address?: string
  user_agent?: string
  documento_url?: string
}

interface Politica {
  id: string
  nome: string
  versao: string
  conteudo: string
  obrigatoria: boolean
  data_publicacao: string
  data_atualizacao?: string
}

interface PedidoLGPD {
  id: string
  cliente_id: string
  tipo: 'acesso' | 'retificacao' | 'eliminacao' | 'portabilidade' | 'restricao'
  descricao: string
  status: 'pendente' | 'analise' | 'concluido' | 'rejeitado'
  resposta?: string
  data_pedido: string
  data_resposta?: string
  prazo_dias: number
}

interface LGPDState {
  consentimentos: Consentimento[]
  politicas: Politica[]
  pedidos: PedidoLGPD[]

  fetchAll: () => Promise<void>
  solicitarConsentimento: (cliente_id: string, tipo: ConsentimentoTipo) => void
  responderConsentimento: (id: string, status: ConsentimentoStatus) => void
  revogarConsentimento: (id: string) => void
  
  addPolitica: (politica: Omit<Politica, 'id' | 'data_publicacao'>) => void
  atualizarPolitica: (id: string, conteudo: string) => void
  
  criarPedido: (pedido: Omit<PedidoLGPD, 'id' | 'status' | 'data_pedido'>) => void
  responderPedido: (id: string, status: PedidoLGPD['status'], resposta: string) => void
  
  getConsentimentosByCliente: (cliente_id: string) => Consentimento[]
  getPedidosPendentes: () => PedidoLGPD[]
  getPedidosForaPrazo: () => PedidoLGPD[]
  
  anonimizarDados: (cliente_id: string) => void
  exportarDados: (cliente_id: string) => string
}

const MOCK_CONSENTIMENTOS: Consentimento[] = [
  {
    id: '1',
    cliente_id: '1',
    tipo: 'processamento_dados',
    status: 'aceite',
    versao: '1.0',
    data_solicitacao: '2024-01-15',
    data_resposta: '2024-01-15',
  },
  {
    id: '2',
    cliente_id: '1',
    tipo: 'marketing',
    status: 'recusado',
    versao: '1.0',
    data_solicitacao: '2024-01-15',
    data_resposta: '2024-01-15',
  },
]

const MOCK_POLITICAS: Politica[] = [
  {
    id: '1',
    nome: 'Política de Privacidade',
    versao: '1.0',
    conteudo: 'Esta política descreve como tratamos os seus dados pessoais...',
    obrigatoria: true,
    data_publicacao: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Política de Cookies',
    versao: '1.0',
    conteudo: 'Utilizamos cookies para melhorar a sua experiência...',
    obrigatoria: true,
    data_publicacao: '2024-01-01',
  },
]

const MOCK_PEDIDOS: PedidoLGPD[] = [
  {
    id: '1',
    cliente_id: '1',
    tipo: 'acesso',
    descricao: 'Solicito acesso a todos os meus dados pessoais',
    status: 'concluido',
    resposta: 'Dados enviados por email em formato PDF',
    data_pedido: '2024-01-20',
    data_resposta: '2024-01-25',
    prazo_dias: 30,
  },
]

export const useLGPDStore = create<LGPDState>()(
  persist(
    (set, get) => ({
      consentimentos: MOCK_CONSENTIMENTOS,
      politicas: MOCK_POLITICAS,
      pedidos: MOCK_PEDIDOS,

      fetchAll: async () => {
        const [consentimentos, politicas, pedidos] = await Promise.all([
          fetchOrSeed<Consentimento>('/lgpd_consentimentos', 'lgpd_consentimentos', get().consentimentos),
          fetchOrSeed<Politica>('/lgpd_politicas', 'lgpd_politicas', get().politicas),
          fetchOrSeed<PedidoLGPD>('/lgpd_pedidos', 'lgpd_pedidos', get().pedidos),
        ])
        set({ consentimentos, politicas, pedidos })
      },

      solicitarConsentimento: (cliente_id, tipo) => {
        const novo: Consentimento = {
          id: crypto.randomUUID(),
          cliente_id,
          tipo,
          status: 'pendente',
          versao: '1.0',
          data_solicitacao: new Date().toISOString(),
        }
        set((state) => ({ consentimentos: [...state.consentimentos, novo] }))
        api.post('/lgpd_consentimentos', novo).catch((e) => console.error(e))
      },

      responderConsentimento: (id, status) => {
        const data_resposta = new Date().toISOString()
        set((state) => ({
          consentimentos: state.consentimentos.map((c) =>
            c.id === id ? { ...c, status, data_resposta } : c
          ),
        }))
        api.put(`/lgpd_consentimentos/${id}`, { status, data_resposta }).catch((e) => console.error(e))
      },

      revogarConsentimento: (id) => {
        get().responderConsentimento(id, 'revogado')
      },

      addPolitica: (politicaData) => {
        const nova: Politica = {
          ...politicaData,
          id: crypto.randomUUID(),
          data_publicacao: new Date().toISOString(),
        }
        set((state) => ({ politicas: [...state.politicas, nova] }))
        api.post('/lgpd_politicas', nova).catch((e) => console.error(e))
      },

      atualizarPolitica: (id, conteudo) => {
        const data_atualizacao = new Date().toISOString()
        set((state) => ({
          politicas: state.politicas.map((p) =>
            p.id === id ? { ...p, conteudo, data_atualizacao } : p
          ),
        }))
        api.put(`/lgpd_politicas/${id}`, { conteudo, data_atualizacao }).catch((e) => console.error(e))
      },

      criarPedido: (pedidoData) => {
        const novo: PedidoLGPD = {
          ...pedidoData,
          id: crypto.randomUUID(),
          status: 'pendente',
          data_pedido: new Date().toISOString(),
        }
        set((state) => ({ pedidos: [...state.pedidos, novo] }))
        api.post('/lgpd_pedidos', novo).catch((e) => console.error(e))
      },

      responderPedido: (id, status, resposta) => {
        const data_resposta = new Date().toISOString()
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === id ? { ...p, status, resposta, data_resposta } : p
          ),
        }))
        api.put(`/lgpd_pedidos/${id}`, { status, resposta, data_resposta }).catch((e) => console.error(e))
      },

      getConsentimentosByCliente: (cliente_id) => {
        return get().consentimentos.filter((c) => c.cliente_id === cliente_id)
      },

      getPedidosPendentes: () => {
        return get().pedidos.filter((p) => p.status === 'pendente')
      },

      getPedidosForaPrazo: () => {
        const hoje = new Date()
        return get().pedidos.filter((p) => {
          if (p.status !== 'pendente') return false
          const dataPedido = new Date(p.data_pedido)
          const diasDecorridos = Math.floor((hoje.getTime() - dataPedido.getTime()) / (1000 * 60 * 60 * 24))
          return diasDecorridos > p.prazo_dias
        })
      },

      anonimizarDados: (cliente_id) => {
        // Simula anonimização
        console.log(`Dados do cliente ${cliente_id} anonimizados`)
      },

      exportarDados: (cliente_id) => {
        // Simula exportação
        return JSON.stringify({ cliente_id, dados: '...' })
      },
    }),
    {
      name: 'lgpd-storage',
    }
  )
)
