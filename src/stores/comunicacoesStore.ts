import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

export interface Comunicacao {
  id: string
  tipo: 'email' | 'sms' | 'whatsapp' | 'notificacao_push'
  destinatario: string
  assunto?: string
  mensagem: string
  status: 'pendente' | 'enviado' | 'entregue' | 'lido' | 'falhado'
  processo_id?: string
  cliente_id?: string
  data_agendamento?: string
  data_envio?: string
  error_msg?: string
  created_at: string
}

export interface TemplateComunicacao {
  id: string
  nome: string
  tipo: 'email' | 'sms' | 'whatsapp'
  assunto?: string
  corpo: string
  variaveis: string[]
}

interface ComunicacoesState {
  comunicacoes: Comunicacao[]
  templates: TemplateComunicacao[]

  fetchAll: () => Promise<void>
  enviarComunicacao: (comunicacao: Omit<Comunicacao, 'id' | 'status' | 'created_at'>) => Promise<Comunicacao>
  agendarComunicacao: (comunicacao: Omit<Comunicacao, 'id' | 'status' | 'created_at'>, data_agendamento: string) => void
  getComunicacoesByProcesso: (processo_id: string) => Comunicacao[]
  getComunicacoesPendentes: () => Comunicacao[]
  processarAgendadas: () => void

  addTemplate: (template: Omit<TemplateComunicacao, 'id'>) => void
  getTemplate: (id: string) => TemplateComunicacao | undefined
  aplicarTemplate: (template_id: string, variaveis: Record<string, string>) => string
}

const TEMPLATES_PADRAO: TemplateComunicacao[] = [
  {
    id: '1',
    nome: 'Prazo Iminente',
    tipo: 'email',
    assunto: 'Prazo Processual - {{numero_processo}}',
    corpo: `Prezado(a) {{nome_cliente}},

Informamos que o prazo para {{tipo_prazo}} no processo {{numero_processo}} termina em {{data_prazo}}.

Para mais informações, aceda ao seu portal: https://escritorio.pt/portal

Atenciosamente,
{{nome_escritorio}}`,
    variaveis: ['nome_cliente', 'numero_processo', 'tipo_prazo', 'data_prazo', 'nome_escritorio'],
  },
  {
    id: '2',
    nome: 'Audiência Confirmada',
    tipo: 'sms',
    corpo: '{{nome_escritorio}}: Audiência marcada para {{data_audiencia}} às {{hora_audiencia}} no {{tribunal}}. Processo: {{numero_processo}}',
    variaveis: ['nome_escritorio', 'data_audiencia', 'hora_audiencia', 'tribunal', 'numero_processo'],
  },
  {
    id: '3',
    nome: 'Fatura Emitida',
    tipo: 'email',
    assunto: 'Fatura {{numero_fatura}} - {{nome_escritorio}}',
    corpo: `Exmo(a). Sr(a). {{nome_cliente}},

Emitimos a fatura nº {{numero_fatura}} no valor de {{valor_fatura}}€.

Data de vencimento: {{data_vencimento}}

Pode consultar e pagar em: https://escritorio.pt/portal/faturas

Obrigado pela confiança.
{{nome_escritorio}}`,
    variaveis: ['nome_cliente', 'numero_fatura', 'valor_fatura', 'data_vencimento', 'nome_escritorio'],
  },
  {
    id: '4',
    nome: 'Atualização Processo',
    tipo: 'whatsapp',
    corpo: 'Olá {{nome_cliente}}! Há novidades no seu processo {{numero_processo}}. {{resumo_atualizacao}}. Aceda ao portal para detalhes.',
    variaveis: ['nome_cliente', 'numero_processo', 'resumo_atualizacao'],
  },
]

export const useComunicacoesStore = create<ComunicacoesState>()(
  persist(
    (set, get) => ({
      comunicacoes: [],
      templates: TEMPLATES_PADRAO,

      fetchAll: async () => {
        const [comunicacoes, templates] = await Promise.all([
          fetchOrSeed<Comunicacao>('/comunicacoes', 'comunicacoes', get().comunicacoes),
          fetchOrSeed<TemplateComunicacao>('/templates_comunicacao', 'templates_comunicacao', get().templates),
        ])
        set({ comunicacoes, templates })
      },

      enviarComunicacao: async (comunicacaoData) => {
        const novaComunicacao: Comunicacao = {
          ...comunicacaoData,
          id: crypto.randomUUID(),
          status: 'enviado',
          data_envio: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }

        set((state) => ({ comunicacoes: [...state.comunicacoes, novaComunicacao] }))
        api.post('/comunicacoes', novaComunicacao).catch((e) => console.error(e))

        return novaComunicacao
      },

      agendarComunicacao: (comunicacaoData, data_agendamento) => {
        const novaComunicacao: Comunicacao = {
          ...comunicacaoData,
          id: crypto.randomUUID(),
          status: 'pendente',
          data_agendamento,
          created_at: new Date().toISOString(),
        }
        set((state) => ({ comunicacoes: [...state.comunicacoes, novaComunicacao] }))
        api.post('/comunicacoes', novaComunicacao).catch((e) => console.error(e))
      },

      getComunicacoesByProcesso: (processo_id) => {
        return get().comunicacoes.filter((c) => c.processo_id === processo_id)
      },

      getComunicacoesPendentes: () => {
        return get().comunicacoes.filter(
          (c) => c.status === 'pendente' && c.data_agendamento && new Date(c.data_agendamento) <= new Date()
        )
      },

      processarAgendadas: () => {
        const pendentes = get().getComunicacoesPendentes()
        pendentes.forEach((comunicacao) => {
          get().enviarComunicacao(comunicacao)
        })
      },

      addTemplate: (template) => {
        const novoTemplate: TemplateComunicacao = {
          ...template,
          id: crypto.randomUUID(),
        }
        set((state) => ({ templates: [...state.templates, novoTemplate] }))
        api.post('/templates_comunicacao', novoTemplate).catch((e) => console.error(e))
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id)
      },

      aplicarTemplate: (template_id, variaveis) => {
        const template = get().getTemplate(template_id)
        if (!template) return ''

        let resultado = template.corpo
        Object.entries(variaveis).forEach(([chave, valor]) => {
          resultado = resultado.replace(new RegExp(`{{${chave}}}`, 'g'), valor)
        })
        return resultado
      },
    }),
    {
      name: 'comunicacoes-storage',
    }
  )
)
