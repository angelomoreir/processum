import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed, PORTAL_TOKEN_KEY } from '../lib/api'
import type { Cliente, Processo, Fatura, Documento } from '../types'

interface PortalCliente {
  id: string
  cliente_id: string
  email: string
  password_hash?: string
  ativo: boolean
  ultimo_acesso?: string
  created_at: string
}

interface MensagemChat {
  id: string
  processo_id: string
  remetente: 'cliente' | 'advogado'
  autor_id: string
  autor_nome: string
  mensagem: string
  arquivo_url?: string
  data_envio: string
  lida: boolean
}

interface PortalDados {
  cliente: Cliente | null
  processos: Processo[]
  faturas: Fatura[]
  documentos: Documento[]
}

interface PortalClienteState {
  acessos: PortalCliente[]
  mensagens: MensagemChat[]
  clienteLogado: PortalCliente | null
  portalDados: PortalDados

  fetchAll: () => Promise<void>
  fetchMensagensPortal: () => Promise<void>
  fetchPortalDados: () => Promise<void>
  loginCliente: (email: string, password: string) => Promise<PortalCliente | null>
  logoutCliente: () => void
  criarAcesso: (cliente_id: string, email: string, password: string) => void
  desativarAcesso: (id: string) => void
  reativarAcesso: (id: string) => void

  enviarMensagem: (mensagem: Omit<MensagemChat, 'id' | 'data_envio'>) => void
  getMensagensByProcesso: (processo_id: string) => MensagemChat[]
  marcarComoLida: (id: string) => void
  getMensagensNaoLidas: (cliente_id: string) => number
}

const MOCK_MENSAGENS: MensagemChat[] = [
  {
    id: '1',
    processo_id: '1',
    remetente: 'advogado',
    autor_id: '1',
    autor_nome: 'Dr. João Silva',
    mensagem: 'Bom dia. A audiência foi remarcada para dia 25/01. Confirmo presença?',
    data_envio: new Date(Date.now() - 86400000).toISOString(),
    lida: false,
  },
  {
    id: '2',
    processo_id: '1',
    remetente: 'cliente',
    autor_id: '1',
    autor_nome: 'João Ferreira',
    mensagem: 'Sim, estarei presente. Obrigado pelo aviso.',
    data_envio: new Date(Date.now() - 43200000).toISOString(),
    lida: true,
  },
]

export const usePortalClienteStore = create<PortalClienteState>()(
  persist(
    (set, get) => ({
      acessos: [],
      mensagens: MOCK_MENSAGENS,
      clienteLogado: null,
      portalDados: { cliente: null, processos: [], faturas: [], documentos: [] },

      fetchAll: async () => {
        const [acessos, mensagens] = await Promise.all([
          fetchOrSeed<PortalCliente>('/portal_acessos', 'portal_acessos', []),
          fetchOrSeed<MensagemChat>('/portal_mensagens', 'portal_mensagens', get().mensagens),
        ])
        set({ acessos, mensagens })
      },

      fetchMensagensPortal: async () => {
        try {
          const mensagens = await api.portalGet<MensagemChat[]>('/portal/mensagens')
          set({ mensagens })
        } catch (e) {
          console.error(e)
        }
      },

      fetchPortalDados: async () => {
        try {
          const [cliente, processos, faturas, documentos] = await Promise.all([
            api.portalGet<Cliente>('/portal/me'),
            api.portalGet<Processo[]>('/portal/processos'),
            api.portalGet<Fatura[]>('/portal/faturas'),
            api.portalGet<Documento[]>('/portal/documentos'),
          ])
          set({ portalDados: { cliente, processos, faturas, documentos } })
        } catch (e) {
          console.error(e)
        }
      },

      loginCliente: async (email, password) => {
        try {
          const res = await api.post<{ token: string; acesso: PortalCliente }>(
            '/portal/login',
            { email: email.toLowerCase().trim(), password }
          )
          localStorage.setItem(PORTAL_TOKEN_KEY, res.token)
          set({ clienteLogado: res.acesso })
          await Promise.all([
            get().fetchPortalDados(),
            get().fetchMensagensPortal(),
          ])
          return res.acesso
        } catch {
          return null
        }
      },

      logoutCliente: () => {
        localStorage.removeItem(PORTAL_TOKEN_KEY)
        set({ clienteLogado: null, portalDados: { cliente: null, processos: [], faturas: [], documentos: [] } })
      },

      criarAcesso: (cliente_id, email, password) => {
        api
          .post<PortalCliente>('/portal/acessos', {
            cliente_id,
            email: email.toLowerCase().trim(),
            password,
          })
          .then((acesso) =>
            set((state) => ({ acessos: [...state.acessos, acesso] }))
          )
          .catch((e) => console.error(e))
      },

      desativarAcesso: (id) => {
        set((state) => ({
          acessos: state.acessos.map((a) =>
            a.id === id ? { ...a, ativo: false } : a
          ),
        }))
        api.put(`/portal_acessos/${id}`, { ativo: false }).catch((e) => console.error(e))
      },

      reativarAcesso: (id) => {
        set((state) => ({
          acessos: state.acessos.map((a) =>
            a.id === id ? { ...a, ativo: true } : a
          ),
        }))
        api.put(`/portal_acessos/${id}`, { ativo: true }).catch((e) => console.error(e))
      },

      enviarMensagem: (mensagem) => {
        const novaMensagem: MensagemChat = {
          ...mensagem,
          id: crypto.randomUUID(),
          data_envio: new Date().toISOString(),
        }
        set((state) => ({ mensagens: [...state.mensagens, novaMensagem] }))
        if (get().clienteLogado && mensagem.remetente === 'cliente') {
          api
            .portalPost('/portal/mensagens', {
              processo_id: mensagem.processo_id,
              mensagem: mensagem.mensagem,
            })
            .catch((e) => console.error(e))
        } else {
          api.post('/portal_mensagens', novaMensagem).catch((e) => console.error(e))
        }
      },

      getMensagensByProcesso: (processo_id) => {
        return get().mensagens.filter((m) => m.processo_id === processo_id)
      },

      marcarComoLida: (id) => {
        set((state) => ({
          mensagens: state.mensagens.map((m) =>
            m.id === id ? { ...m, lida: true } : m
          ),
        }))
        api.put(`/portal_mensagens/${id}`, { lida: true }).catch((e) => console.error(e))
      },

      getMensagensNaoLidas: (cliente_id) => {
        const processosDoCliente = get().mensagens
          .filter((m) => m.autor_id === cliente_id || m.remetente === 'cliente')
          .map((m) => m.processo_id)
        const processosUnicos = new Set(processosDoCliente)
        return get().mensagens.filter(
          (m) => !m.lida && m.remetente === 'advogado' && processosUnicos.has(m.processo_id)
        ).length
      },
    }),
    {
      name: 'portal-cliente-storage-v3',
    }
  )
)
