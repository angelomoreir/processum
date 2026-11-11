import { create } from 'zustand'
import type { Documento, MinutaGerada } from '../types'

interface AIStoreState {
  isAnalyzing: boolean
  analisarDocumento: (documento: Documento) => Promise<AnaliseDocumentoResult>
  gerarMinuta: (tipo: string, dados: Record<string, string>) => Promise<MinutaGerada>
  sugerirPrazos: (processoId: string, tipoProcesso: string) => PrazoSugerido[]
  chatbotConsulta: (pergunta: string) => Promise<string>
}

interface AnaliseDocumentoResult {
  entidades: string[]
  datas: string[]
  valores: string[]
  tipoDocumento: string
  resumo: string
  prazosSugeridos: PrazoSugerido[]
}

interface PrazoSugerido {
  titulo: string
  descricao: string
  dias: number
  tipo: 'audiencia' | 'peticao' | 'protocolo' | 'recurso'
}

// Simulação de IA
const CONHECIMENTO_JURIDICO: Record<string, string> = {
  'ação de indemnização': 'Ação destinada a obter reparação por danos materiais ou morais. Prazo para contestação: 15 dias úteis.',
  'processo trabalhista': 'Ação na Justiça do Trabalho. Prazo para contestação: 15 dias úteis. Audiência inicial obrigatória.',
  'divórcio': 'Dissolução de casamento. Pode ser consensual ou litigioso. Prazo para resposta: 15 dias.',
  'petição inicial': 'Documento que inicia o processo judicial. Deve conter: partes, factos, fundamentação jurídica e pedido.',
  'contestação': 'Resposta do réu à petição inicial. Prazo: 15 dias úteis. Pode incluir reconvenção.',
  'agravo': 'Recurso interposto em face de decisões interlocutórias. Prazo: 10 dias.',
  'recurso': 'Meio de impugnação de decisões judiciais. Prazos variam conforme o tipo.',
}

const MINUTAS_TEMPLATES: Record<string, string> = {
  procuracao: `PROCURAÇÃO

OUTORGANTE: {{nome_cliente}}, {{nacionalidade}}, {{estado_civil}}, {{profissao}}, portador do Bilhete de Identidade/Cartão de Cidadão nº {{numero_cc}}, emitido em {{data_emissao}} por {{local_emissao}}, com NIF nº {{nif}}, residente em {{morada}}.

OUTORGADO: Dr. {{nome_advogado}}, Advogado, inscrito na Ordem dos Advogados sob o nº {{numero_oab}}, com escritório profissional sito em {{morada_escritorio}}.

PODERES: O outorgante confere ao outorgado PODERES PARA O REPRESENTAR judicial e extrajudicialmente em {{area_direito}}, especificamente no processo nº {{numero_processo}}, com todos os poderes conferidos pela lei e pelo artigo 15.º do Estatuto da Ordem dos Advogados, podendo substabelecer.

{{local}}, {{data}}

_________________________________
{{nome_cliente}}`,

  peticao_inicial: `PETIÇÃO INICIAL

EXMO. SR. DR. JUIZ DE DIREITO DO {{tribunal}}

{{nome_autor}}, {{qualificacao_autor}}, vem perante V. Exa. propor a presente

AÇÃO DE {{tipo_acao}}

contra {{nome_reu}}, {{qualificacao_reu}}, pelos seguintes motivos de facto e de direito:

I - FACTOS

{{descricao_factos}}

II - FUNDAMENTAÇÃO JURÍDICA

{{fundamentacao_juridica}}

III - PEDIDO

Pelo exposto, requer:

a) A citação do réu para, querendo, contestar;
b) A procedência da ação, condenando o réu a {{pedido}};
c) A condenação do réu em custas e honorários advocaticios.

{{local}}, {{data}}

_________________________________
{{nome_autor}}

Dr. {{nome_advogado}}
Advogado`,

  contestacao: `CONTESTAÇÃO

EXMO. SR. DR. JUIZ DE DIREITO DO {{tribunal}}

Processo nº {{numero_processo}}

{{nome_reu}}, {{qualificacao_reu}}, já devidamente citado, vem perante V. Exa., através de seu Advogado infraassinado, apresentar a presente

CONTESTAÇÃO

à ação proposta por {{nome_autor}}, pelos seguintes motivos de facto e de direito:

I - RESPOSTA ÀS ALEGAÇÕES DO AUTOR

{{resposta_factos}}

II - FUNDAMENTAÇÃO JURÍDICA

{{fundamentacao_juridica}}

III - PEDIDO

Pelo exposto, requer:

a) A total improcedência da ação;
b) A condenação do autor em custas e honorários advocaticios.

{{local}}, {{data}}

Dr. {{nome_advogado}}
Advogado`,
}

export const useAIStore = create<AIStoreState>()((set, _get) => ({
  isAnalyzing: false,

  analisarDocumento: async (documento) => {
    set({ isAnalyzing: true })
    
    // Simula processamento de IA
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const result: AnaliseDocumentoResult = {
      entidades: ['Cliente A', 'Tribunal de Lisboa', 'Dr. Silva'],
      datas: ['15/01/2024', '20/02/2024'],
      valores: ['€25.000,00', '€1.500,00'],
      tipoDocumento: documento.nome.includes('petição') ? 'Petição' : 'Documento Jurídico',
      resumo: 'Documento relativo a processo civil de indemnização. Contém pedido de condenação por danos materiais.',
      prazosSugeridos: [
        { titulo: 'Prazo para Contestação', descricao: 'Resposta à petição inicial', dias: 15, tipo: 'peticao' },
        { titulo: 'Audiência Preliminar', descricao: 'Concentração e tentativa de conciliação', dias: 30, tipo: 'audiencia' },
      ],
    }
    
    set({ isAnalyzing: false })
    return result
  },

  gerarMinuta: async (tipo, dados) => {
    set({ isAnalyzing: true })
    
    // Simula geração
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    let template = MINUTAS_TEMPLATES[tipo] || 'Template não encontrado'
    
    // Substitui placeholders
    Object.entries(dados).forEach(([key, value]) => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    
    set({ isAnalyzing: false })
    
    return {
      id: crypto.randomUUID(),
      tipo,
      conteudo: template,
      dados,
      data_geracao: new Date().toISOString(),
    }
  },

  sugerirPrazos: (_processoId, tipoProcesso) => {
    const prazos: PrazoSugerido[] = []
    
    switch (tipoProcesso.toLowerCase()) {
      case 'civil':
      case 'ação de indemnização':
        prazos.push(
          { titulo: 'Contestação', descricao: 'Prazo para apresentação de resposta', dias: 15, tipo: 'peticao' },
          { titulo: 'Audiência Preliminar', descricao: 'Concentração', dias: 30, tipo: 'audiencia' }
        )
        break
      case 'trabalho':
        prazos.push(
          { titulo: 'Contestação', descricao: 'Prazo para resposta', dias: 15, tipo: 'peticao' },
          { titulo: 'Audiência', descricao: 'Audiência de instrução', dias: 45, tipo: 'audiencia' }
        )
        break
      case 'família':
        prazos.push(
          { titulo: 'Resposta', descricao: 'Prazo para resposta', dias: 15, tipo: 'peticao' }
        )
        break
      default:
        prazos.push(
          { titulo: 'Contestação', descricao: 'Prazo genérico para resposta', dias: 15, tipo: 'peticao' }
        )
    }
    
    return prazos
  },

  chatbotConsulta: async (pergunta) => {
    set({ isAnalyzing: true })
    
    // Simula processamento
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const perguntaLower = pergunta.toLowerCase()
    let resposta = 'Desculpe, não tenho informação específica sobre essa questão. Sugiro consultar a legislação aplicável ou um colega especializado.'
    
    // Procura no conhecimento
    for (const [key, value] of Object.entries(CONHECIMENTO_JURIDICO)) {
      if (perguntaLower.includes(key)) {
        resposta = value
        break
      }
    }
    
    // Respostas genéricas para perguntas comuns
    if (perguntaLower.includes('prazo') && perguntaLower.includes('contestação')) {
      resposta = 'O prazo para contestação é de 15 dias úteis, contados a partir da citação do réu, conforme artigo 153.º do CPC.'
    } else if (perguntaLower.includes('jurisdição')) {
      resposta = 'A jurisdição é determinada pelo valor da causa, natureza da matéria e localização das partes. Consulte os arts. 40.º a 62.º do CPC.'
    } else if (perguntaLower.includes('honorários')) {
      resposta = 'Os honorários advocatícios são regulados pelo Regulamento n.º 150/2022 e pela tabela da Ordem dos Advogados. Podem ser fixos ou percentuais.'
    }
    
    set({ isAnalyzing: false })
    return resposta
  },
}))
