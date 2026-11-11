import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// === CITIUS / TRIBUNAIS ===
interface ProcessoCitius {
  numero: string
  tribunal: string
  partes: {
    autor: string
    reu: string
  }
  data_distribuicao: string
  movimentacoes: {
    data: string
    descricao: string
    tipo: string
  }[]
  prazos: {
    tipo: string
    data_vencimento: string
    status: 'pendente' | 'cumprido' | 'expirado'
  }[]
}

// === DGSI / JURISPRUDÊNCIA ===
interface Acordao {
  id: string
  tribunal: string
  data: string
  numero: string
  sumario: string
  texto_integral: string
  area: string
  relator: string
  decisao: string
  votacao: string
  url: string
}

// === DIÁRIO DA REPÚBLICA ===
interface Legislacao {
  id: string
  tipo: 'lei' | 'decreto' | 'portaria' | 'despacho'
  numero: string
  data: string
  sumario: string
  link: string
  area_direito: string[]
  relevante: boolean
}

// === CONSERVATÓRIA ===
interface EmpresaCRC {
  nif: string
  denominacao: string
  forma_juridica: string
  sede: string
  capital_social: number
  objeto: string
  representantes: {
    nome: string
    cargo: string
    cc_nif: string
  }[]
  certidao_url?: string
}

// === PAGAMENTOS ===
interface PagamentoMBWay {
  id: string
  telefone: string
  valor: number
  descricao: string
  referencia: string
  status: 'pendente' | 'autorizado' | 'rejeitado' | 'expirado'
  data_criacao: string
  data_resposta?: string
}

interface PagamentoMultibanco {
  id: string
  entidade: string
  referencia: string
  valor: number
  descricao: string
  data_limite: string
  status: 'pendente' | 'pago'
  data_pagamento?: string
}

// === LINKEDIN ===
interface ContactoLinkedIn {
  id: string
  nome: string
  cargo: string
  empresa: string
  email?: string
  telefone?: string
  foto?: string
  url_perfil: string
  importado: boolean
  data_importacao?: string
}

interface IntegracoesState {
  // Citius
  processosCitius: ProcessoCitius[]
  consultarCitius: (numero: string) => Promise<ProcessoCitius | null>
  protocolarCitius: (dados: any) => Promise<{ sucesso: boolean; protocolo?: string; erro?: string }>
  
  // DGSI
  acordaos: Acordao[]
  pesquisarJurisprudencia: (termo: string, area?: string) => Promise<Acordao[]>
  getAcordaoById: (id: string) => Acordao | undefined
  
  // Diário da República
  legislacoes: Legislacao[]
  alertasLegais: string[] // Áreas com alerta ativo
  pesquisarLegislacao: (termo: string, tipo?: string) => Promise<Legislacao[]>
  ativarAlerta: (area: string) => void
  desativarAlerta: (area: string) => void
  
  // Conservatória
  empresasCRC: EmpresaCRC[]
  consultarCRC: (nif: string) => Promise<EmpresaCRC | null>
  
  // Pagamentos
  pagamentosMBWay: PagamentoMBWay[]
  pagamentosMultibanco: PagamentoMultibanco[]
  criarPagamentoMBWay: (dados: Omit<PagamentoMBWay, 'id' | 'status' | 'data_criacao' | 'referencia'>) => Promise<PagamentoMBWay>
  criarReferenciaMultibanco: (valor: number, descricao: string) => Promise<PagamentoMultibanco>
  verificarPagamento: (id: string, tipo: 'mbway' | 'multibanco') => Promise<string>
  
  // LinkedIn
  contactosLinkedIn: ContactoLinkedIn[]
  importarContacto: (url_perfil: string) => Promise<ContactoLinkedIn | null>
  pesquisarLinkedIn: (termo: string) => Promise<ContactoLinkedIn[]>
}

// Mock data
const MOCK_ACORDAOS: Acordao[] = [
  {
    id: '1',
    tribunal: 'STJ',
    data: '2024-01-15',
    numero: '1234/24.0T8STJ.S1',
    sumario: 'Responsabilidade civil. Acidente de viação. Culpa comparada.',
    texto_integral: 'I - O acidente de viação ocorreu em 15/03/2023, na Avenida da Liberdade...',
    area: 'Civil',
    relator: 'Dr. Silva Pereira',
    decisao: 'Provimento parcial',
    votacao: 'Unânime',
    url: 'https://dgsi.pt/jurisprudencia/1',
  },
  {
    id: '2',
    tribunal: 'Tribunal do Trabalho de Lisboa',
    data: '2024-02-01',
    numero: '567/24.0T8T.LS1',
    sumario: 'Despedimento disciplinar. Falta grave. Justa causa.',
    texto_integral: 'I - O trabalhador foi despedido em 10/01/2024 por faltas injustificadas...',
    area: 'Trabalho',
    relator: 'Dra. Maria Santos',
    decisao: 'Improcedente',
    votacao: 'Unânime',
    url: 'https://dgsi.pt/jurisprudencia/2',
  },
]

const MOCK_EMPRESAS: EmpresaCRC[] = [
  {
    nif: '501234567',
    denominacao: 'Empresa ABC, Lda.',
    forma_juridica: 'Sociedade por Quotas',
    sede: 'Av. da Liberdade, 100, Lisboa',
    capital_social: 50000,
    objeto: 'Consultoria e serviços de informática',
    representantes: [
      { nome: 'João Silva', cargo: 'Gerente', cc_nif: '12345678-1 ZY' },
    ],
  },
]

const MOCK_LEGISLACAO: Legislacao[] = [
  {
    id: '1',
    tipo: 'lei',
    numero: 'Lei n.º 1/2024',
    data: '2024-01-15',
    sumario: 'Altera o Código Civil no que respeita à responsabilidade civil.',
    link: 'https://diariodarepublica.pt/lei-1-2024',
    area_direito: ['Civil'],
    relevante: true,
  },
  {
    id: '2',
    tipo: 'decreto',
    numero: 'Decreto-Lei n.º 15/2024',
    data: '2024-02-01',
    sumario: 'Regime jurídico do teletrabalho.',
    link: 'https://diariodarepublica.pt/dl-15-2024',
    area_direito: ['Trabalho'],
    relevante: true,
  },
]

export const useIntegracoesStore = create<IntegracoesState>()(
  persist(
    (set, get) => ({
      processosCitius: [],
      acordaos: MOCK_ACORDAOS,
      legislacoes: MOCK_LEGISLACAO,
      alertasLegais: ['Civil', 'Trabalho'],
      empresasCRC: MOCK_EMPRESAS,
      pagamentosMBWay: [],
      pagamentosMultibanco: [],
      contactosLinkedIn: [],

      // CITIUS
      consultarCitius: async (numero) => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        // Simula consulta
        const mockProcesso: ProcessoCitius = {
          numero,
          tribunal: 'Tribunal Judicial de Lisboa - 1ª Secção Civil',
          partes: {
            autor: 'João Ferreira',
            reu: 'Seguradora XPTO, SA',
          },
          data_distribuicao: '2024-01-15',
          movimentacoes: [
            { data: '2024-01-15', descricao: 'Distribuição do processo', tipo: 'distribuicao' },
            { data: '2024-01-20', descricao: 'Citação do réu', tipo: 'citacao' },
            { data: '2024-02-15', descricao: 'Contestação apresentada', tipo: 'contestacao' },
            { data: '2024-03-10', descricao: 'Audiência prévia marcada para 15/05/2024', tipo: 'audiencia' },
          ],
          prazos: [
            { tipo: 'Contestação', data_vencimento: '2024-02-15', status: 'cumprido' },
            { tipo: 'Audiência', data_vencimento: '2024-05-15', status: 'pendente' },
          ],
        }
        
        set((state) => ({
          processosCitius: [...state.processosCitius, mockProcesso],
        }))
        
        return mockProcesso
      },

      protocolarCitius: async (_dados) => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        
        // Simula protocolo
        return {
          sucesso: true,
          protocolo: `CITIUS-${Date.now()}`,
        }
      },

      // DGSI
      pesquisarJurisprudencia: async (termo, area) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        return get().acordaos.filter((a) => {
          const matchTermo = 
            a.sumario.toLowerCase().includes(termo.toLowerCase()) ||
            a.tribunal.toLowerCase().includes(termo.toLowerCase()) ||
            a.relator.toLowerCase().includes(termo.toLowerCase())
          const matchArea = !area || a.area === area
          return matchTermo && matchArea
        })
      },

      getAcordaoById: (id) => {
        return get().acordaos.find((a) => a.id === id)
      },

      // Diário da República
      pesquisarLegislacao: async (termo, tipo) => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        return get().legislacoes.filter((l) => {
          const matchTermo = 
            l.sumario.toLowerCase().includes(termo.toLowerCase()) ||
            l.numero.toLowerCase().includes(termo.toLowerCase())
          const matchTipo = !tipo || l.tipo === tipo
          return matchTermo && matchTipo
        })
      },

      ativarAlerta: (area) => {
        set((state) => ({
          alertasLegais: [...state.alertasLegais, area],
        }))
      },

      desativarAlerta: (area) => {
        set((state) => ({
          alertasLegais: state.alertasLegais.filter((a) => a !== area),
        }))
      },

      // Conservatória
      consultarCRC: async (nif) => {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        return get().empresasCRC.find((e) => e.nif === nif) || null
      },

      // Pagamentos
      criarPagamentoMBWay: async (dados) => {
        const novoPagamento: PagamentoMBWay = {
          ...dados,
          id: crypto.randomUUID(),
          status: 'pendente',
          referencia: `MBW${Date.now()}`,
          data_criacao: new Date().toISOString(),
        }
        
        set((state) => ({
          pagamentosMBWay: [...state.pagamentosMBWay, novoPagamento],
        }))
        
        // Simula resposta do cliente após 5 segundos (80% aceite)
        setTimeout(() => {
          const aceite = Math.random() > 0.2
          set((state) => ({
            pagamentosMBWay: state.pagamentosMBWay.map((p) =>
              p.id === novoPagamento.id
                ? { ...p, status: aceite ? 'autorizado' : 'rejeitado', data_resposta: new Date().toISOString() }
                : p
            ),
          }))
        }, 5000)
        
        return novoPagamento
      },

      criarReferenciaMultibanco: async (valor, descricao) => {
        const entidade = '12345'
        const referencia = Math.random().toString().slice(2, 11)
        
        const novoPagamento: PagamentoMultibanco = {
          id: crypto.randomUUID(),
          entidade,
          referencia,
          valor,
          descricao,
          data_limite: new Date(Date.now() + 30 * 86400000).toISOString(),
          status: 'pendente',
        }
        
        set((state) => ({
          pagamentosMultibanco: [...state.pagamentosMultibanco, novoPagamento],
        }))
        
        return novoPagamento
      },

      verificarPagamento: async (id, tipo) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        if (tipo === 'mbway') {
          const p = get().pagamentosMBWay.find((p) => p.id === id)
          return p?.status || 'desconhecido'
        } else {
          const p = get().pagamentosMultibanco.find((p) => p.id === id)
          return p?.status || 'desconhecido'
        }
      },

      // LinkedIn
      importarContacto: async (url_perfil) => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        
        // Simula scraping
        const mockContacto: ContactoLinkedIn = {
          id: crypto.randomUUID(),
          nome: 'Contacto Importado ' + Math.random().toString(36).substring(2, 8),
          cargo: 'Diretor Jurídico',
          empresa: 'Empresa XYZ, SA',
          email: 'contacto' + Math.random().toString(36).substring(2, 5) + '@empresa.pt',
          url_perfil,
          importado: true,
          data_importacao: new Date().toISOString(),
        }
        
        set((state) => ({
          contactosLinkedIn: [...state.contactosLinkedIn, mockContacto],
        }))
        
        return mockContacto
      },

      pesquisarLinkedIn: async (termo) => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        // Retorna mock + contactos importados
        const mockResults: ContactoLinkedIn[] = [
          {
            id: 'mock1',
            nome: 'Dr. Pedro Almeida',
            cargo: 'Advogado Sénior',
            empresa: 'Silva & Associados',
            url_perfil: 'https://linkedin.com/in/pedro-almeida',
            importado: false,
          },
          {
            id: 'mock2',
            nome: 'Dra. Ana Costa',
            cargo: 'Consultora Jurídica',
            empresa: 'Legal Partners',
            url_perfil: 'https://linkedin.com/in/ana-costa',
            importado: false,
          },
        ]
        
        return [...mockResults, ...get().contactosLinkedIn].filter((c) =>
          c.nome.toLowerCase().includes(termo.toLowerCase()) ||
          c.empresa.toLowerCase().includes(termo.toLowerCase())
        )
      },
    }),
    {
      name: 'integracoes-storage',
    }
  )
)
