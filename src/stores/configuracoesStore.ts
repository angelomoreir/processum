import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

type Tema = 'light' | 'dark' | 'system'
type Idioma = 'pt-PT' | 'pt-BR' | 'en' | 'es'

interface Permissao {
  modulo: string
  ver: boolean
  criar: boolean
  editar: boolean
  eliminar: boolean
}

interface ConfiguracoesState {
  fetchAll: () => Promise<void>

  // Tema
  tema: Tema
  setTema: (tema: Tema) => void
  
  // Idioma
  idioma: Idioma
  setIdioma: (idioma: Idioma) => void
  
  // Permissões por perfil
  permissoes: Record<string, Permissao[]>
  
  // Notificações
  notificacoes: {
    email: boolean
    desktop: boolean
    som: boolean
    prazos_24h: boolean
    prazos_7d: boolean
    faturas_pendentes: boolean
  }
  setNotificacao: (chave: keyof ConfiguracoesState['notificacoes'], valor: boolean) => void
  
  // Workflow
  workflow: {
    aprovacao_faturas: boolean
    aprovacao_descontos: boolean
    dupla_verificacao: boolean
  }
  setWorkflow: (chave: keyof ConfiguracoesState['workflow'], valor: boolean) => void
  
  // Dados pessoais
  dadosEscritorio: {
    nome: string
    nif: string
    morada: string
    telefone: string
    email: string
    logo_url?: string
  }
  setDadosEscritorio: (dados: Partial<ConfiguracoesState['dadosEscritorio']>) => void
  
  // Integrações
  integracoes: {
    google_calendar: boolean
    outlook: boolean
    zoom: boolean
    dropbox: boolean
  }
  setIntegracao: (chave: keyof ConfiguracoesState['integracoes'], valor: boolean) => void
}

const PERMISSOES_PADRAO: Record<string, Permissao[]> = {
  socio: [
    { modulo: 'clientes', ver: true, criar: true, editar: true, eliminar: true },
    { modulo: 'processos', ver: true, criar: true, editar: true, eliminar: true },
    { modulo: 'financeiro', ver: true, criar: true, editar: true, eliminar: true },
    { modulo: 'configuracoes', ver: true, criar: true, editar: true, eliminar: true },
  ],
  advogado: [
    { modulo: 'clientes', ver: true, criar: true, editar: true, eliminar: false },
    { modulo: 'processos', ver: true, criar: true, editar: true, eliminar: false },
    { modulo: 'financeiro', ver: true, criar: true, editar: false, eliminar: false },
    { modulo: 'configuracoes', ver: false, criar: false, editar: false, eliminar: false },
  ],
  estagiario: [
    { modulo: 'clientes', ver: true, criar: false, editar: false, eliminar: false },
    { modulo: 'processos', ver: true, criar: false, editar: false, eliminar: false },
    { modulo: 'financeiro', ver: false, criar: false, editar: false, eliminar: false },
    { modulo: 'configuracoes', ver: false, criar: false, editar: false, eliminar: false },
  ],
}

function snapshot(state: ConfiguracoesState) {
  return {
    tema: state.tema,
    idioma: state.idioma,
    permissoes: state.permissoes,
    notificacoes: state.notificacoes,
    workflow: state.workflow,
    dadosEscritorio: state.dadosEscritorio,
    integracoes: state.integracoes,
  }
}

export const useConfiguracoesStore = create<ConfiguracoesState>()(
  persist(
    (set, get) => {
      const sync = () => {
        api.put('/configuracoes', snapshot(get())).catch((e) => console.error(e))
      }

      return {
      fetchAll: async () => {
        try {
          const dados = await api.get<Partial<ReturnType<typeof snapshot>>>('/configuracoes')
          if (dados && Object.keys(dados).length > 0) set(dados)
        } catch (e) {
          console.error(e)
        }
      },

      tema: 'light',
      idioma: 'pt-PT',
      permissoes: PERMISSOES_PADRAO,
      
      notificacoes: {
        email: true,
        desktop: true,
        som: true,
        prazos_24h: true,
        prazos_7d: true,
        faturas_pendentes: true,
      },
      
      workflow: {
        aprovacao_faturas: true,
        aprovacao_descontos: true,
        dupla_verificacao: false,
      },
      
      dadosEscritorio: {
        nome: 'Escritório de Advocacia Silva & Associados',
        nif: '123456789',
        morada: 'Av. da Liberdade, 100 - Lisboa',
        telefone: '210 123 456',
        email: 'geral@silvaadvogados.pt',
      },
      
      integracoes: {
        google_calendar: false,
        outlook: false,
        zoom: false,
        dropbox: false,
      },

      setTema: (tema) => { set({ tema }); sync() },
      setIdioma: (idioma) => { set({ idioma }); sync() },

      setNotificacao: (chave, valor) => {
        set((state) => ({
          notificacoes: { ...state.notificacoes, [chave]: valor },
        }))
        sync()
      },

      setWorkflow: (chave, valor) => {
        set((state) => ({
          workflow: { ...state.workflow, [chave]: valor },
        }))
        sync()
      },

      setDadosEscritorio: (dados) => {
        set((state) => ({
          dadosEscritorio: { ...state.dadosEscritorio, ...dados },
        }))
        sync()
      },

      setIntegracao: (chave, valor) => {
        set((state) => ({
          integracoes: { ...state.integracoes, [chave]: valor },
        }))
        sync()
      },
      }
    },
    {
      name: 'configuracoes-storage',
    }
  )
)
