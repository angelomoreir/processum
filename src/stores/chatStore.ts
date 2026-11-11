import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

interface MensagemChat {
  id: string
  canal_id: string
  autor_id: string
  autor_nome: string
  conteudo: string
  tipo: 'texto' | 'arquivo' | 'sistema'
  arquivo_url?: string
  timestamp: string
  editado?: string
  reply_to?: string
}

interface CanalChat {
  id: string
  nome: string
  tipo: 'geral' | 'processo' | 'privado' | 'departamento'
  participantes: string[]
  processo_id?: string
  departamento_id?: string
  criado_por: string
  created_at: string
}

interface ChatState {
  canais: CanalChat[]
  mensagens: MensagemChat[]
  canalAtivo: string | null
  ultimasLeituras: Record<string, string> // canal_id+usuario_id → timestamp

  fetchAll: () => Promise<void>
  criarCanal: (canal: Omit<CanalChat, 'id' | 'created_at'>) => void
  addMensagem: (mensagem: Omit<MensagemChat, 'id' | 'timestamp'>) => void
  setCanalAtivo: (id: string | null) => void
  
  getMensagensByCanal: (canal_id: string) => MensagemChat[]
  getCanaisByUsuario: (usuario_id: string) => CanalChat[]
  getCanaisByProcesso: (processo_id: string) => CanalChat[]
  getMensagensNaoLidas: (canal_id: string, usuario_id: string) => number
  
  marcarComoLida: (canal_id: string, usuario_id: string) => void
}

const MOCK_CANAIS: CanalChat[] = [
  {
    id: '1',
    nome: 'Geral',
    tipo: 'geral',
    participantes: ['1', '2'],
    criado_por: '1',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Processo 12345/2024',
    tipo: 'processo',
    participantes: ['1', '2'],
    processo_id: '1',
    criado_por: '1',
    created_at: '2024-01-15',
  },
]

const MOCK_MENSAGENS: MensagemChat[] = [
  {
    id: '1',
    canal_id: '1',
    autor_id: '1',
    autor_nome: 'Dr. João Silva',
    conteudo: 'Bom dia a todos!',
    tipo: 'texto',
    timestamp: '2024-02-01T09:00:00',
  },
  {
    id: '2',
    canal_id: '1',
    autor_id: '2',
    autor_nome: 'Dra. Maria Santos',
    conteudo: 'Bom dia! Como vai o processo da indemnização?',
    tipo: 'texto',
    timestamp: '2024-02-01T09:15:00',
  },
  {
    id: '3',
    canal_id: '2',
    autor_id: '1',
    autor_nome: 'Dr. João Silva',
    conteudo: 'Vamos agendar a audiência para a próxima semana?',
    tipo: 'texto',
    timestamp: '2024-02-01T10:30:00',
  },
]

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      canais: MOCK_CANAIS,
      mensagens: MOCK_MENSAGENS,
      canalAtivo: '1',
      ultimasLeituras: {},

      fetchAll: async () => {
        const [canais, mensagens] = await Promise.all([
          fetchOrSeed<CanalChat>('/chat_canais', 'chat_canais', get().canais),
          fetchOrSeed<MensagemChat>('/chat_mensagens', 'chat_mensagens', get().mensagens),
        ])
        let ultimasLeituras = get().ultimasLeituras
        try {
          const leituras = await api.get<{ canal_id: string; usuario_id: string; timestamp: string }[]>('/chat_leituras')
          ultimasLeituras = { ...ultimasLeituras }
          leituras.forEach((l) => {
            ultimasLeituras[`${l.canal_id}:${l.usuario_id}`] = l.timestamp
          })
        } catch (e) {
          console.error(e)
        }
        set({ canais, mensagens, ultimasLeituras })
      },

      criarCanal: (canalData) => {
        const novo: CanalChat = {
          ...canalData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        set((state) => ({ canais: [...state.canais, novo] }))
        api.post('/chat_canais', novo).catch((e) => console.error(e))
      },

      addMensagem: (mensagemData) => {
        const nova: MensagemChat = {
          ...mensagemData,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        }
        set((state) => ({ mensagens: [...state.mensagens, nova] }))
        api.post('/chat_mensagens', nova).catch((e) => console.error(e))
      },

      setCanalAtivo: (id) => {
        set({ canalAtivo: id })
      },

      getMensagensByCanal: (canal_id) => {
        return get().mensagens
          .filter((m) => m.canal_id === canal_id)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      },

      getCanaisByUsuario: (usuario_id) => {
        return get().canais.filter((c) => c.participantes.includes(usuario_id))
      },

      getCanaisByProcesso: (processo_id) => {
        return get().canais.filter((c) => c.processo_id === processo_id)
      },

      getMensagensNaoLidas: (canal_id, usuario_id) => {
        const chave = `${canal_id}:${usuario_id}`
        const ultimaLeitura = get().ultimasLeituras[chave]
        return get().mensagens.filter(
          (m) =>
            m.canal_id === canal_id &&
            m.autor_id !== usuario_id &&
            (!ultimaLeitura || new Date(m.timestamp) > new Date(ultimaLeitura))
        ).length
      },

      marcarComoLida: (canal_id, usuario_id) => {
        const chave = `${canal_id}:${usuario_id}`
        const timestamp = new Date().toISOString()
        set((state) => ({
          ultimasLeituras: {
            ...state.ultimasLeituras,
            [chave]: timestamp,
          },
        }))
        api.post('/chat_leituras', { canal_id, timestamp }).catch((e) => console.error(e))
      },
    }),
    {
      name: 'chat-storage',
    }
  )
)
