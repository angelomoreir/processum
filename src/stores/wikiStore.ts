import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, fetchOrSeed } from '../lib/api'

interface ArtigoWiki {
  id: string
  titulo: string
  conteudo: string
  categoria: string
  tags: string[]
  autor_id: string
  autor_nome: string
  views: number
  ultima_edicao: string
  created_at: string
}

interface FAQ {
  id: string
  pergunta: string
  resposta: string
  categoria: string
  util: number
  nao_util: number
  created_at: string
}

interface WikiState {
  artigos: ArtigoWiki[]
  faqs: FAQ[]

  fetchAll: () => Promise<void>
  addArtigo: (artigo: Omit<ArtigoWiki, 'id' | 'views' | 'ultima_edicao' | 'created_at'>) => void
  updateArtigo: (id: string, dados: Partial<ArtigoWiki>) => void
  incrementarViews: (id: string) => void
  
  addFAQ: (faq: Omit<FAQ, 'id' | 'util' | 'nao_util' | 'created_at'>) => void
  votarFAQ: (id: string, util: boolean) => void
  
  pesquisar: (termo: string) => { artigos: ArtigoWiki[]; faqs: FAQ[] }
  getArtigosByCategoria: (categoria: string) => ArtigoWiki[]
  getFAQsByCategoria: (categoria: string) => FAQ[]
  getArtigosPopulares: (limite?: number) => ArtigoWiki[]
}

const MOCK_ARTIGOS: ArtigoWiki[] = [
  {
    id: '1',
    titulo: 'Como calcular prazos processuais',
    conteudo: `## Cálculo de Prazos Processuais

Os prazos processuais em Portugal são contados em dias corridos, salvo disposição em contrário.

### Regras Gerais:
- **Dias úteis**: Excluem sábados, domingos e feriados
- **Dias corridos**: Incluem todos os dias do calendário
- **Horário**: O prazo termina às 24h do último dia

### Exemplos:
1. **Contestação**: 15 dias úteis após citação
2. **Recurso**: 10 dias após intimação
3. **Audiência**: Data marcada pelo tribunal`,
    categoria: 'Procedimentos',
    tags: ['prazos', 'processo', 'CPC'],
    autor_id: '1',
    autor_nome: 'Dr. João Silva',
    views: 150,
    ultima_edicao: '2024-01-15',
    created_at: '2024-01-10',
  },
  {
    id: '2',
    titulo: 'Template de Procuração',
    conteudo: `## Modelo de Procuração

**OUTORGANTE**: [Nome], [Nacionalidade], [Estado Civil], [Profissão], portador do BI/CC nº [Número], com NIF [NIF].

**OUTORGADO**: [Nome do Advogado], Advogado, inscrito na OA sob o nº [Nº OAB].

**PODERES**: Poderes para representação judicial e extrajudicial...

[Local], [Data]

Assinatura: ________________`,
    categoria: 'Templates',
    tags: ['procuração', 'minuta', 'documento'],
    autor_id: '2',
    autor_nome: 'Dra. Maria Santos',
    views: 89,
    ultima_edicao: '2024-02-01',
    created_at: '2024-02-01',
  },
  {
    id: '3',
    titulo: 'Fluxo de Trabalho - Novo Processo',
    conteudo: `## Checklist: Abertura de Novo Processo

1. [ ] Verificar conflitos de interesses
2. [ ] Assinar contrato de honorários
3. [ ] Receber adiantamento (se aplicável)
4. [ ] Abrir conta trust (se necessário)
5. [ ] Analisar documentação
6. [ ] Elaborar petição inicial
7. [ ] Protocolar no Citius
8. [ ] Agendar audiência (se aplicável)
9. [ ] Notificar cliente
10. [ ] Criar tarefas no Kanban`,
    categoria: 'Procedimentos',
    tags: ['checklist', 'processo', 'workflow'],
    autor_id: '1',
    autor_nome: 'Dr. João Silva',
    views: 120,
    ultima_edicao: '2024-01-20',
    created_at: '2024-01-20',
  },
]

const MOCK_FAQS: FAQ[] = [
  {
    id: '1',
    pergunta: 'Qual o prazo para contestação?',
    resposta: 'O prazo para contestação é de 15 dias úteis, contados a partir da citação válida do réu, conforme artigo 153.º do Código de Processo Civil.',
    categoria: 'Processo Civil',
    util: 45,
    nao_util: 2,
    created_at: '2024-01-10',
  },
  {
    id: '2',
    pergunta: 'Como calcular os juros de mora?',
    resposta: 'Os juros de mora são calculados à taxa legal em vigor, atualmente de 4,5% ao ano (BCE + 4%). Para cálculos específicos, consulte a taxa aplicável na data da mora.',
    categoria: 'Responsabilidade Civil',
    util: 32,
    nao_util: 1,
    created_at: '2024-01-15',
  },
  {
    id: '3',
    pergunta: 'O que é a prescrição?',
    resposta: 'A prescrição é a perda do direito de exigir o cumprimento de uma obrigação por decorrência do tempo. O prazo geral é de 20 anos (art. 309.º CC), mas existem prazos especiais mais curtos.',
    categoria: 'Direito Civil',
    util: 67,
    nao_util: 3,
    created_at: '2024-01-20',
  },
]

export const useWikiStore = create<WikiState>()(
  persist(
    (set, get) => ({
      artigos: MOCK_ARTIGOS,
      faqs: MOCK_FAQS,

      fetchAll: async () => {
        const [artigos, faqs] = await Promise.all([
          fetchOrSeed<ArtigoWiki>('/wiki_artigos', 'wiki_artigos', get().artigos),
          fetchOrSeed<FAQ>('/wiki_faqs', 'wiki_faqs', get().faqs),
        ])
        set({ artigos, faqs })
      },

      addArtigo: (artigoData) => {
        const agora = new Date().toISOString()
        const novo: ArtigoWiki = {
          ...artigoData,
          id: crypto.randomUUID(),
          views: 0,
          ultima_edicao: agora,
          created_at: agora,
        }
        set((state) => ({ artigos: [...state.artigos, novo] }))
        api.post('/wiki_artigos', novo).catch((e) => console.error(e))
      },

      updateArtigo: (id, dados) => {
        const ultima_edicao = new Date().toISOString()
        set((state) => ({
          artigos: state.artigos.map((a) =>
            a.id === id ? { ...a, ...dados, ultima_edicao } : a
          ),
        }))
        api.put(`/wiki_artigos/${id}`, { ...dados, ultima_edicao }).catch((e) => console.error(e))
      },

      incrementarViews: (id) => {
        const artigo = get().artigos.find((a) => a.id === id)
        if (!artigo) return
        const views = artigo.views + 1
        set((state) => ({
          artigos: state.artigos.map((a) =>
            a.id === id ? { ...a, views } : a
          ),
        }))
        api.put(`/wiki_artigos/${id}`, { views }).catch((e) => console.error(e))
      },

      addFAQ: (faqData) => {
        const novo: FAQ = {
          ...faqData,
          id: crypto.randomUUID(),
          util: 0,
          nao_util: 0,
          created_at: new Date().toISOString(),
        }
        set((state) => ({ faqs: [...state.faqs, novo] }))
        api.post('/wiki_faqs', novo).catch((e) => console.error(e))
      },

      votarFAQ: (id, util) => {
        const faq = get().faqs.find((f) => f.id === id)
        if (!faq) return
        const dados = {
          util: util ? faq.util + 1 : faq.util,
          nao_util: !util ? faq.nao_util + 1 : faq.nao_util,
        }
        set((state) => ({
          faqs: state.faqs.map((f) =>
            f.id === id ? { ...f, ...dados } : f
          ),
        }))
        api.put(`/wiki_faqs/${id}`, dados).catch((e) => console.error(e))
      },

      pesquisar: (termo) => {
        const termoLower = termo.toLowerCase()
        const artigos = get().artigos.filter((a) =>
          a.titulo.toLowerCase().includes(termoLower) ||
          a.conteudo.toLowerCase().includes(termoLower) ||
          a.tags.some((t) => t.toLowerCase().includes(termoLower))
        )
        const faqs = get().faqs.filter((f) =>
          f.pergunta.toLowerCase().includes(termoLower) ||
          f.resposta.toLowerCase().includes(termoLower)
        )
        return { artigos, faqs }
      },

      getArtigosByCategoria: (categoria) => {
        return get().artigos.filter((a) => a.categoria === categoria)
      },

      getFAQsByCategoria: (categoria) => {
        return get().faqs.filter((f) => f.categoria === categoria)
      },

      getArtigosPopulares: (limite = 5) => {
        return [...get().artigos]
          .sort((a, b) => b.views - a.views)
          .slice(0, limite)
      },
    }),
    {
      name: 'wiki-storage',
    }
  )
)
