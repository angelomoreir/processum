import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LogAuditoria } from '../types'
import { api } from '../lib/api'

interface AuditoriaState {
  logs: LogAuditoria[]
  fetchAll: () => Promise<void>
  registrarAcao: (acao: Omit<LogAuditoria, 'id' | 'created_at' | 'ip_address' | 'user_agent'>) => void
  getLogsByEntidade: (entidade: string, entidade_id: string) => LogAuditoria[]
  getLogsByUsuario: (usuario_id: string) => LogAuditoria[]
  getLogsByPeriodo: (data_inicio: string, data_fim: string) => LogAuditoria[]
  getEstatisticas: () => { total: number; por_acao: Record<string, number>; por_entidade: Record<string, number> }
  exportarLogs: (formato: 'csv' | 'json') => string
}

export const useAuditoriaStore = create<AuditoriaState>()(
  persist(
    (set, get) => ({
      logs: [],

      fetchAll: async () => {
        try {
          const logs = await api.get<LogAuditoria[]>('/auditoria_logs')
          set({ logs: logs.reverse() })
        } catch (e) {
          console.error(e)
        }
      },

      registrarAcao: (acaoData) => {
        const novoLog: LogAuditoria = {
          ...acaoData,
          id: crypto.randomUUID(),
          ip_address: '127.0.0.1', // Em produção: detectar IP real
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        }
        set((state) => ({ logs: [novoLog, ...state.logs] }))
        api.post('/auditoria_logs', novoLog).catch((e) => console.error(e))
      },

      getLogsByEntidade: (entidade, entidade_id) => {
        return get().logs.filter(
          (l) => l.entidade === entidade && l.entidade_id === entidade_id
        )
      },

      getLogsByUsuario: (usuario_id) => {
        return get().logs.filter((l) => l.usuario_id === usuario_id)
      },

      getLogsByPeriodo: (data_inicio, data_fim) => {
        return get().logs.filter((l) => {
          const data = new Date(l.created_at)
          return data >= new Date(data_inicio) && data <= new Date(data_fim)
        })
      },

      getEstatisticas: () => {
        const logs = get().logs
        const por_acao: Record<string, number> = {}
        const por_entidade: Record<string, number> = {}
        
        logs.forEach((l) => {
          por_acao[l.acao] = (por_acao[l.acao] || 0) + 1
          por_entidade[l.entidade] = (por_entidade[l.entidade] || 0) + 1
        })
        
        return {
          total: logs.length,
          por_acao,
          por_entidade,
        }
      },

      exportarLogs: (formato) => {
        const logs = get().logs
        
        if (formato === 'json') {
          return JSON.stringify(logs, null, 2)
        }
        
        // CSV
        const headers = ['Data', 'Ação', 'Entidade', 'Entidade ID', 'Usuário', 'Detalhes']
        const rows = logs.map((l) => [
          l.created_at,
          l.acao,
          l.entidade,
          l.entidade_id,
          l.usuario_id,
          JSON.stringify(l.detalhes),
        ])
        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      },
    }),
    {
      name: 'auditoria-storage',
    }
  )
)
