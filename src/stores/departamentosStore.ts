import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

interface Departamento {
  id: string
  nome: string
  area_direito: string
  responsavel_id: string
  descricao: string
  cor: string
  ativo: boolean
  metas: {
    faturacao_mensal: number
    horas_minimas: number
    novos_clientes: number
  }
}

interface MembroDepartamento {
  usuario_id: string
  departamento_id: string
  data_entrada: string
  cargo: string
}

interface DepartamentosState {
  departamentos: Departamento[]
  membros: MembroDepartamento[]

  fetchAll: () => Promise<void>
  addDepartamento: (departamento: Omit<Departamento, 'id' | 'ativo'>) => void
  updateDepartamento: (id: string, dados: Partial<Departamento>) => void
  desativarDepartamento: (id: string) => void
  
  addMembro: (membro: Omit<MembroDepartamento, 'data_entrada'>) => void
  removeMembro: (usuario_id: string, departamento_id: string) => void
  
  getDepartamentoById: (id: string) => Departamento | undefined
  getMembrosByDepartamento: (departamento_id: string) => MembroDepartamento[]
  getDepartamentosByArea: (area: string) => Departamento[]
}

const DEPARTAMENTOS_PADRAO: Departamento[] = [
  {
    id: '1',
    nome: 'Direito Civil',
    area_direito: 'Civil',
    responsavel_id: '1',
    descricao: 'Processos cíveis, contratos, responsabilidade civil',
    cor: '#3b82f6',
    ativo: true,
    metas: {
      faturacao_mensal: 15000,
      horas_minimas: 120,
      novos_clientes: 3,
    },
  },
  {
    id: '2',
    nome: 'Direito do Trabalho',
    area_direito: 'Trabalho',
    responsavel_id: '2',
    descricao: 'Despedimentos, acidentes de trabalho, contratos laborais',
    cor: '#10b981',
    ativo: true,
    metas: {
      faturacao_mensal: 10000,
      horas_minimas: 100,
      novos_clientes: 2,
    },
  },
  {
    id: '3',
    nome: 'Direito da Família',
    area_direito: 'Família',
    responsavel_id: '1',
    descricao: 'Divórcios, guarda de filhos, pensões alimentícias',
    cor: '#f59e0b',
    ativo: true,
    metas: {
      faturacao_mensal: 8000,
      horas_minimas: 80,
      novos_clientes: 2,
    },
  },
  {
    id: '4',
    nome: 'Direito Penal',
    area_direito: 'Penal',
    responsavel_id: '2',
    descricao: 'Defesa criminal, processos penais',
    cor: '#ef4444',
    ativo: true,
    metas: {
      faturacao_mensal: 12000,
      horas_minimas: 110,
      novos_clientes: 2,
    },
  },
  {
    id: '5',
    nome: 'Direito Empresarial',
    area_direito: 'Comercial',
    responsavel_id: '1',
    descricao: 'Constituição de empresas, fusões, aquisições',
    cor: '#8b5cf6',
    ativo: true,
    metas: {
      faturacao_mensal: 20000,
      horas_minimas: 140,
      novos_clientes: 4,
    },
  },
  {
    id: '6',
    nome: 'Direito Fiscal',
    area_direito: 'Fiscal',
    responsavel_id: '2',
    descricao: 'Contencioso fiscal, planeamento fiscal',
    cor: '#06b6d4',
    ativo: true,
    metas: {
      faturacao_mensal: 18000,
      horas_minimas: 130,
      novos_clientes: 3,
    },
  },
]

const MEMBROS_PADRAO: MembroDepartamento[] = [
  { usuario_id: '1', departamento_id: '1', data_entrada: '2023-01-15', cargo: 'Coordenador' },
  { usuario_id: '1', departamento_id: '3', data_entrada: '2023-01-15', cargo: 'Advogado' },
  { usuario_id: '2', departamento_id: '2', data_entrada: '2023-02-01', cargo: 'Coordenador' },
  { usuario_id: '2', departamento_id: '4', data_entrada: '2023-02-01', cargo: 'Advogado' },
]

export const useDepartamentosStore = create<DepartamentosState>()(
  persist(
    (set, get) => ({
      departamentos: DEPARTAMENTOS_PADRAO,
      membros: MEMBROS_PADRAO,

      fetchAll: async () => {
        const departamentos = await fetchOrSeed<Departamento>(
          '/departamentos',
          'departamentos',
          get().departamentos
        )
        let membros = get().membros
        try {
          const rows = await api.get<MembroDepartamento[]>('/departamento_membros')
          if (rows.length > 0) {
            membros = rows
          } else if (membros.length > 0) {
            membros.forEach((m) =>
              api.post('/departamento_membros', m).catch((e) => console.error(e))
            )
          }
        } catch (e) {
          console.error(e)
        }
        set({ departamentos, membros })
      },

      addDepartamento: (departamento) => {
        const novo: Departamento = {
          ...departamento,
          id: crypto.randomUUID(),
          ativo: true,
        }
        set((state) => ({ departamentos: [...state.departamentos, novo] }))
        api.post('/departamentos', novo).catch((e) => console.error(e))
      },

      updateDepartamento: (id, dados) => {
        set((state) => ({
          departamentos: state.departamentos.map((d) =>
            d.id === id ? { ...d, ...dados } : d
          ),
        }))
        api.put(`/departamentos/${id}`, dados).catch((e) => console.error(e))
      },

      desativarDepartamento: (id) => {
        get().updateDepartamento(id, { ativo: false })
      },

      addMembro: (membro) => {
        const novo: MembroDepartamento = {
          ...membro,
          data_entrada: new Date().toISOString(),
        }
        set((state) => ({ membros: [...state.membros, novo] }))
        api.post('/departamento_membros', novo).catch((e) => console.error(e))
      },

      removeMembro: (usuario_id, departamento_id) => {
        set((state) => ({
          membros: state.membros.filter(
            (m) => !(m.usuario_id === usuario_id && m.departamento_id === departamento_id)
          ),
        }))
        api.del(`/departamento_membros/${usuario_id}/${departamento_id}`).catch((e) => console.error(e))
      },

      getDepartamentoById: (id) => {
        return get().departamentos.find((d) => d.id === id)
      },

      getMembrosByDepartamento: (departamento_id) => {
        return get().membros.filter((m) => m.departamento_id === departamento_id)
      },

      getDepartamentosByArea: (area) => {
        return get().departamentos.filter((d) => d.area_direito === area)
      },
    }),
    {
      name: 'departamentos-storage',
    }
  )
)
