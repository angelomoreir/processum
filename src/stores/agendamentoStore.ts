import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

export interface Agendamento {
  id: string
  titulo: string
  descricao?: string
  data_inicio: string
  data_fim: string
  tipo: 'consulta' | 'audiencia' | 'reuniao' | 'prazo' | 'outro'
  cliente_id?: string
  processo_id?: string
  responsavel_id: string
  sala?: string
  videochamada_url?: string
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  notificacoes_enviadas: {
    email_24h: boolean
    email_1h: boolean
    sms_24h: boolean
  }
  created_at: string
}

interface SalaReuniao {
  id: string
  nome: string
  capacidade: number
  recursos: string[]
  localizacao: string
}

interface AgendamentoState {
  agendamentos: Agendamento[]
  salas: SalaReuniao[]

  fetchAll: () => Promise<void>
  addAgendamento: (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'notificacoes_enviadas' | 'status'> & { status?: Agendamento['status'] }) => void
  updateAgendamento: (id: string, dados: Partial<Agendamento>) => void
  cancelarAgendamento: (id: string) => void
  confirmarAgendamento: (id: string) => void

  getAgendamentosByData: (data: string) => Agendamento[]
  getAgendamentosByCliente: (cliente_id: string) => Agendamento[]
  getAgendamentosByResponsavel: (responsavel_id: string) => Agendamento[]
  getConflitos: (data_inicio: string, data_fim: string, responsavel_id: string) => Agendamento[]

  checkDisponibilidade: (sala_id: string, data_inicio: string, data_fim: string) => boolean
  sincronizarGoogleCalendar: () => Promise<boolean>
  sincronizarOutlook: () => Promise<boolean>
}

const SALAS_PADRAO: SalaReuniao[] = [
  { id: '1', nome: 'Sala de Reuniões A', capacidade: 8, recursos: ['projetor', 'video'], localizacao: '1º Andar' },
  { id: '2', nome: 'Sala de Reuniões B', capacidade: 4, recursos: ['teleconferencia'], localizacao: '1º Andar' },
  { id: '3', nome: 'Sala de Audiências', capacidade: 12, recursos: ['projetor', 'video', 'gravacao'], localizacao: 'Rés-do-chão' },
  { id: '4', nome: 'Sala de Consultas', capacidade: 3, recursos: [], localizacao: '2º Andar' },
]

const MOCK_AGENDAMENTOS: Agendamento[] = [
  {
    id: '1',
    titulo: 'Consulta - João Ferreira',
    descricao: 'Discussão sobre processo de indemnização',
    data_inicio: '2024-02-15T10:00:00',
    data_fim: '2024-02-15T11:00:00',
    tipo: 'consulta',
    cliente_id: '1',
    processo_id: '1',
    responsavel_id: '1',
    sala: '1',
    status: 'confirmado',
    notificacoes_enviadas: { email_24h: true, email_1h: false, sms_24h: true },
    created_at: '2024-02-10',
  },
  {
    id: '2',
    titulo: 'Audiência - Processo 12345/2024',
    descricao: 'Audiência de instrução',
    data_inicio: '2024-02-20T09:00:00',
    data_fim: '2024-02-20T12:00:00',
    tipo: 'audiencia',
    cliente_id: '1',
    processo_id: '1',
    responsavel_id: '1',
    sala: '3',
    videochamada_url: 'https://zoom.us/j/123456',
    status: 'agendado',
    notificacoes_enviadas: { email_24h: false, email_1h: false, sms_24h: false },
    created_at: '2024-02-12',
  },
]

export const useAgendamentoStore = create<AgendamentoState>()(
  persist(
    (set, get) => ({
      agendamentos: MOCK_AGENDAMENTOS,
      salas: SALAS_PADRAO,

      fetchAll: async () => {
        const rows = await fetchOrSeed<Agendamento>('/agendamentos', 'agendamentos', get().agendamentos)
        set({ agendamentos: rows })
      },

      addAgendamento: (agendamentoData) => {
        const novo: Agendamento = {
          status: 'agendado',
          ...agendamentoData,
          id: crypto.randomUUID(),
          notificacoes_enviadas: { email_24h: false, email_1h: false, sms_24h: false },
          created_at: new Date().toISOString(),
        }
        set((state) => ({ agendamentos: [...state.agendamentos, novo] }))
        api.post('/agendamentos', novo).catch((e) => console.error(e))
      },

      updateAgendamento: (id, dados) => {
        set((state) => ({
          agendamentos: state.agendamentos.map((a) =>
            a.id === id ? { ...a, ...dados } : a
          ),
        }))
        api.put(`/agendamentos/${id}`, dados).catch((e) => console.error(e))
      },

      cancelarAgendamento: (id) => {
        get().updateAgendamento(id, { status: 'cancelado' })
      },

      confirmarAgendamento: (id) => {
        get().updateAgendamento(id, { status: 'confirmado' })
      },

      getAgendamentosByData: (data) => {
        return get().agendamentos.filter((a) =>
          a.data_inicio.startsWith(data) && a.status !== 'cancelado'
        )
      },

      getAgendamentosByCliente: (cliente_id) => {
        return get().agendamentos.filter((a) => a.cliente_id === cliente_id)
      },

      getAgendamentosByResponsavel: (responsavel_id) => {
        return get().agendamentos.filter(
          (a) => a.responsavel_id === responsavel_id && a.status !== 'cancelado'
        )
      },

      getConflitos: (data_inicio, data_fim, responsavel_id) => {
        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        return get().agendamentos.filter((a) => {
          if (a.responsavel_id !== responsavel_id || a.status === 'cancelado') return false
          const aInicio = new Date(a.data_inicio)
          const aFim = new Date(a.data_fim)
          return (inicio < aFim && fim > aInicio)
        })
      },

      checkDisponibilidade: (sala_id, data_inicio, data_fim) => {
        const inicio = new Date(data_inicio)
        const fim = new Date(data_fim)

        return !get().agendamentos.some((a) => {
          if (a.sala !== sala_id || a.status === 'cancelado') return false
          const aInicio = new Date(a.data_inicio)
          const aFim = new Date(a.data_fim)
          return (inicio < aFim && fim > aInicio)
        })
      },

      sincronizarGoogleCalendar: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return true
      },

      sincronizarOutlook: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return true
      },
    }),
    {
      name: 'agendamento-storage',
    }
  )
)
