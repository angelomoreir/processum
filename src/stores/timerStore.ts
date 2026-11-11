import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './authStore'

export interface SessaoTimer {
  id: string
  usuario_id?: string
  inicio: string
  fim?: string
  duracao_segundos: number
  descricao?: string
  responsavel_id?: string
  processo_id?: string
  cliente_id?: string
  tarefa_id?: string
  faturado: boolean
  running: boolean
}

interface TimerState {
  sessoes: SessaoTimer[]
  sessaoAtiva: SessaoTimer | null
  tempoDecorrido: number
  _intervalId: ReturnType<typeof setInterval> | null

  fetchAll: () => Promise<void>
  iniciarTimer: (dados: Partial<SessaoTimer>) => void
  pausarTimer: () => void
  retomarTimer: () => void
  pararTimer: () => SessaoTimer | null
  
  getTempoFormatado: () => string
  getSessoesHoje: () => SessaoTimer[]
  getTempoTotalHoje: () => number
  
  sugerirRegisto: () => { processo_id?: string; cliente_id?: string; confianca: number } | null
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  sessoes: [],
  sessaoAtiva: null,
  tempoDecorrido: 0,
  _intervalId: null,

  fetchAll: async () => {
    try {
      const sessoes = await api.get<SessaoTimer[]>('/timer_sessoes')
      set({ sessoes })
    } catch (e) {
      console.error(e)
    }
  },

  iniciarTimer: (dados) => {
    // Limpa qualquer intervalo existente antes de criar um novo
    const intervalAnterior = get()._intervalId
    if (intervalAnterior !== null) {
      clearInterval(intervalAnterior)
    }

    const novaSessao: SessaoTimer = {
      id: crypto.randomUUID(),
      inicio: new Date().toISOString(),
      duracao_segundos: 0,
      faturado: false,
      running: true,
      ...dados,
    }

    const interval = setInterval(() => {
      const { sessaoAtiva } = get()
      if (sessaoAtiva && sessaoAtiva.running) {
        set((state) => ({ tempoDecorrido: state.tempoDecorrido + 1 }))
      }
    }, 1000)

    set({ sessaoAtiva: novaSessao, tempoDecorrido: 0, _intervalId: interval })
  },

  pausarTimer: () => {
    set((state) => ({
      sessaoAtiva: state.sessaoAtiva 
        ? { ...state.sessaoAtiva, running: false } 
        : null,
    }))
  },

  retomarTimer: () => {
    set((state) => ({
      sessaoAtiva: state.sessaoAtiva 
        ? { ...state.sessaoAtiva, running: true } 
        : null,
    }))
  },

  pararTimer: () => {
    const { sessaoAtiva, _intervalId, tempoDecorrido } = get()
    if (!sessaoAtiva) return null

    if (_intervalId !== null) {
      clearInterval(_intervalId)
    }

    const sessaoCompleta: SessaoTimer = {
      ...sessaoAtiva,
      fim: new Date().toISOString(),
      duracao_segundos: tempoDecorrido,
      running: false,
    }

    set((state) => ({
      sessoes: [...state.sessoes, sessaoCompleta],
      sessaoAtiva: null,
      tempoDecorrido: 0,
      _intervalId: null,
    }))

    const usuario_id = useAuthStore.getState().user?.id
    const { responsavel_id: _r, ...row } = sessaoCompleta
    void _r
    api.post('/timer_sessoes', { ...row, usuario_id }).catch((e) => console.error(e))

    return sessaoCompleta
  },

  getTempoFormatado: () => {
    const segundos = get().tempoDecorrido
    const h = Math.floor(segundos / 3600)
    const m = Math.floor((segundos % 3600) / 60)
    const s = segundos % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  },

  getSessoesHoje: () => {
    const hoje = new Date().toISOString().split('T')[0]
    return get().sessoes.filter((s) => s.inicio.startsWith(hoje))
  },

  getTempoTotalHoje: () => {
    return get()
      .getSessoesHoje()
      .reduce((acc, s) => acc + s.duracao_segundos, get().tempoDecorrido)
  },

  sugerirRegisto: () => {
    // Simula sugestão baseada em padrões de uso
    const hora = new Date().getHours()
    
    // Sugestões baseadas em horário
    if (hora >= 9 && hora <= 12) {
      return { processo_id: '1', cliente_id: '1', confianca: 0.7 }
    }
    
    return null
  },
}))
