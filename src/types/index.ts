export type PerfilUsuario = 'socio' | 'advogado' | 'estagiario' | 'administrativo';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: PerfilUsuario;
  oab?: string;
  created_at: string;
}

export type EstagioLead = 'lead' | 'contatado' | 'reuniao' | 'contratado' | 'ativo';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  morada?: string;
  estagio: EstagioLead;
  area_direito?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export type StatusProcesso = 'ativo' | 'arquivado' | 'concluido' | 'suspenso';

export interface Processo {
  id: string;
  numero: string;
  descricao: string;
  cliente_id: string;
  cliente?: Cliente;
  advogado_responsavel_id: string;
  advogado_responsavel?: Usuario;
  status: StatusProcesso;
  area_direito: string;
  tribunal?: string;
  data_abertura: string;
  data_fecho?: string;
  valor_causa?: number;
  created_at: string;
  updated_at: string;
}

export type PrioridadePrazo = 'baixa' | 'media' | 'alta' | 'urgente';
export type TipoPrazo = 'audiencia' | 'protocolo' | 'peticao' | 'recurso' | 'outro';

export interface Prazo {
  id: string;
  titulo: string;
  descricao?: string;
  processo_id: string;
  processo?: Processo;
  data_inicio: string;
  data_fim: string;
  tipo: TipoPrazo;
  prioridade: PrioridadePrazo;
  concluido: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RegistroHora {
  id: string;
  processo_id: string;
  processo?: Processo;
  advogado_id: string;
  advogado?: Usuario;
  data: string;
  atividade: string;
  duracao_minutos: number;
  faturavel: boolean;
  valor_hora?: number;
  notas?: string;
  created_at: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  processo_id?: string;
  cliente_id?: string;
  uploaded_by: string;
  versao: number;
  created_at: string;
}

export interface Comunicacao {
  id: string;
  cliente_id: string;
  tipo: 'email' | 'telefone' | 'reuniao' | 'nota';
  assunto: string;
  conteudo?: string;
  data: string;
  created_by: string;
  created_at: string;
}

export interface ConfiguracaoPrazo {
  id: string;
  nome: string;
  tipo: TipoPrazo;
  regra_calculo: string;
  dias_uteis: boolean;
  prazo_padrao_dias: number;
}

// === TAREFAS ===
export type StatusTarefa = 'pendente' | 'em_progresso' | 'concluida' | 'arquivada';
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  processo_id?: string;
  responsavel_id: string;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  data_limite?: string;
  etiquetas?: string[];
  created_at: string;
  updated_at: string;
}

// === FINANCEIRO ===
export type StatusFatura = 'rascunho' | 'emitida' | 'pendente' | 'paga' | 'atrasada' | 'cancelada';

export interface ItemFatura {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface Fatura {
  id: string;
  numero: string;
  cliente_id: string;
  processo_id?: string;
  valor_total: number;
  valor_iva: number;
  valor_liquido: number;
  data_emissao: string;
  data_vencimento: string;
  status: StatusFatura;
  itens: ItemFatura[];
  notas?: string;
  created_at: string;
  updated_at: string;
}

export type CategoriaDespesa = 'fixa' | 'pessoal' | 'operacional' | 'imposto' | 'outro';

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  data: string;
  comprovativo_url?: string;
  created_at: string;
}

export interface RelatorioFinanceiro {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  lucro: number;
  faturasEmitidas: number;
  faturasPagas: number;
  faturasPendentes: number;
}

// === AI & AUTOMATION ===
export interface MinutaGerada {
  id: string;
  tipo: string;
  conteudo: string;
  dados: Record<string, string>;
  data_geracao: string;
}

export interface AnaliseDocumentoAI {
  entidades: string[];
  datas: string[];
  valores: string[];
  tipo_documento: string;
  resumo: string;
  confianca: number;
}

// === AUDITORIA ===
export interface LogAuditoria {
  id: string;
  acao: 'criar' | 'atualizar' | 'eliminar' | 'visualizar' | 'exportar';
  entidade: string;
  entidade_id: string;
  usuario_id: string;
  detalhes: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
