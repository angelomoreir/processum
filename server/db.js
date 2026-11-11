import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'processum.db')

fs.mkdirSync(DATA_DIR, { recursive: true })

export const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

// Compat helper: better-sqlite3-style transaction wrapper
db.transaction = (fn) => (...args) => {
  db.exec('BEGIN')
  try {
    const result = fn(...args)
    db.exec('COMMIT')
    return result
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'advogado',
  oab TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS convites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  perfil TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  nif TEXT,
  morada TEXT,
  estagio TEXT NOT NULL DEFAULT 'lead',
  area_direito TEXT,
  notas TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS processos (
  id TEXT PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  descricao TEXT,
  cliente_id TEXT,
  advogado_responsavel_id TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  area_direito TEXT,
  tribunal TEXT,
  data_abertura TEXT,
  data_fecho TEXT,
  valor_causa REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prazos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  processo_id TEXT,
  data_inicio TEXT,
  data_fim TEXT,
  tipo TEXT DEFAULT 'outro',
  prioridade TEXT DEFAULT 'media',
  concluido INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tarefas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  processo_id TEXT,
  responsavel_id TEXT,
  status TEXT DEFAULT 'pendente',
  prioridade TEXT DEFAULT 'media',
  data_limite TEXT,
  etiquetas TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS horas (
  id TEXT PRIMARY KEY,
  processo_id TEXT,
  advogado_id TEXT,
  data TEXT,
  atividade TEXT,
  duracao_minutos INTEGER DEFAULT 0,
  faturavel INTEGER DEFAULT 0,
  valor_hora REAL,
  notas TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documentos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  tamanho INTEGER DEFAULT 0,
  url TEXT,
  processo_id TEXT,
  cliente_id TEXT,
  uploaded_by TEXT,
  versao INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faturas (
  id TEXT PRIMARY KEY,
  numero TEXT,
  cliente_id TEXT,
  processo_id TEXT,
  valor_total REAL DEFAULT 0,
  valor_iva REAL DEFAULT 0,
  valor_liquido REAL DEFAULT 0,
  data_emissao TEXT,
  data_vencimento TEXT,
  status TEXT DEFAULT 'rascunho',
  itens TEXT,
  notas TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS despesas (
  id TEXT PRIMARY KEY,
  descricao TEXT,
  categoria TEXT,
  valor REAL DEFAULT 0,
  data TEXT,
  comprovativo_url TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comunicacoes (
  id TEXT PRIMARY KEY,
  tipo TEXT,
  destinatario TEXT,
  assunto TEXT,
  mensagem TEXT,
  status TEXT DEFAULT 'pendente',
  processo_id TEXT,
  cliente_id TEXT,
  data_agendamento TEXT,
  data_envio TEXT,
  error_msg TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates_comunicacao (
  id TEXT PRIMARY KEY,
  nome TEXT,
  tipo TEXT,
  assunto TEXT,
  corpo TEXT,
  variaveis TEXT
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TEXT,
  data_fim TEXT,
  tipo TEXT DEFAULT 'outro',
  cliente_id TEXT,
  processo_id TEXT,
  responsavel_id TEXT,
  sala TEXT,
  videochamada_url TEXT,
  status TEXT DEFAULT 'agendado',
  notificacoes_enviadas TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orcamentos (
  id TEXT PRIMARY KEY,
  numero TEXT,
  cliente_id TEXT,
  processo_id TEXT,
  titulo TEXT,
  descricao TEXT,
  itens TEXT,
  valor_total REAL DEFAULT 0,
  validade_dias INTEGER DEFAULT 30,
  data_emissao TEXT,
  data_validade TEXT,
  status TEXT DEFAULT 'rascunho',
  notas TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS retainers (
  id TEXT PRIMARY KEY,
  cliente_id TEXT,
  tipo TEXT,
  valor_total REAL DEFAULT 0,
  horas_incluidas REAL,
  horas_consumidas REAL DEFAULT 0,
  data_inicio TEXT,
  data_fim TEXT,
  status TEXT DEFAULT 'ativo',
  alerta_80 INTEGER DEFAULT 0,
  alerta_100 INTEGER DEFAULT 0,
  faturas TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conflitos_partes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  nif TEXT,
  tipo TEXT,
  contato TEXT,
  notas TEXT,
  alerta_conflito INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS conflitos_relacoes (
  id TEXT PRIMARY KEY,
  parte_a_id TEXT,
  parte_b_id TEXT,
  tipo TEXT,
  processo_id TEXT,
  data_relacao TEXT
);

CREATE TABLE IF NOT EXISTS conflitos_detectados (
  id TEXT PRIMARY KEY,
  tipo TEXT,
  severidade TEXT,
  descricao TEXT,
  partes_envolvidas TEXT,
  processo_id TEXT,
  status TEXT DEFAULT 'pendente',
  data_detecao TEXT,
  resolucao TEXT
);

CREATE TABLE IF NOT EXISTS departamentos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  area_direito TEXT,
  responsavel_id TEXT,
  descricao TEXT,
  cor TEXT,
  ativo INTEGER DEFAULT 1,
  metas TEXT
);

CREATE TABLE IF NOT EXISTS departamento_membros (
  usuario_id TEXT NOT NULL,
  departamento_id TEXT NOT NULL,
  data_entrada TEXT,
  cargo TEXT,
  PRIMARY KEY (usuario_id, departamento_id)
);

CREATE TABLE IF NOT EXISTS trust_contas (
  id TEXT PRIMARY KEY,
  cliente_id TEXT UNIQUE,
  saldo REAL DEFAULT 0,
  moeda TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'ativa',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_movimentacoes (
  id TEXT PRIMARY KEY,
  conta_id TEXT,
  tipo TEXT,
  valor REAL DEFAULT 0,
  descricao TEXT,
  processo_id TEXT,
  fatura_id TEXT,
  referencia TEXT,
  data_movimentacao TEXT,
  saldo_apos REAL DEFAULT 0,
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS trust_reconciliacoes (
  id TEXT PRIMARY KEY,
  data TEXT,
  saldo_sistema REAL DEFAULT 0,
  saldo_bancario REAL DEFAULT 0,
  diferenca REAL DEFAULT 0,
  justificacao TEXT,
  status TEXT DEFAULT 'pendente'
);

CREATE TABLE IF NOT EXISTS wiki_artigos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  categoria TEXT,
  tags TEXT,
  autor_id TEXT,
  autor_nome TEXT,
  views INTEGER DEFAULT 0,
  ultima_edicao TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wiki_faqs (
  id TEXT PRIMARY KEY,
  pergunta TEXT,
  resposta TEXT,
  categoria TEXT,
  util INTEGER DEFAULT 0,
  nao_util INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_canais (
  id TEXT PRIMARY KEY,
  nome TEXT,
  tipo TEXT DEFAULT 'geral',
  participantes TEXT,
  processo_id TEXT,
  departamento_id TEXT,
  criado_por TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_mensagens (
  id TEXT PRIMARY KEY,
  canal_id TEXT,
  autor_id TEXT,
  autor_nome TEXT,
  conteudo TEXT,
  tipo TEXT DEFAULT 'texto',
  arquivo_url TEXT,
  timestamp TEXT,
  editado TEXT,
  reply_to TEXT
);

CREATE TABLE IF NOT EXISTS chat_leituras (
  canal_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  timestamp TEXT,
  PRIMARY KEY (canal_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS portal_acessos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  ativo INTEGER DEFAULT 1,
  ultimo_acesso TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_mensagens (
  id TEXT PRIMARY KEY,
  processo_id TEXT,
  remetente TEXT,
  autor_id TEXT,
  autor_nome TEXT,
  mensagem TEXT,
  arquivo_url TEXT,
  data_envio TEXT,
  lida INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS marketing_campanhas (
  id TEXT PRIMARY KEY,
  nome TEXT,
  tipo TEXT,
  assunto TEXT,
  conteudo TEXT,
  segmento TEXT,
  agendamento TEXT,
  status TEXT DEFAULT 'rascunho',
  estatisticas TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_nps (
  id TEXT PRIMARY KEY,
  cliente_id TEXT,
  processo_id TEXT,
  nota INTEGER,
  comentario TEXT,
  data TEXT,
  responded INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS marketing_referrals (
  id TEXT PRIMARY KEY,
  indicador_id TEXT,
  indicado_nome TEXT,
  indicado_email TEXT,
  indicado_telefone TEXT,
  status TEXT DEFAULT 'novo',
  recompensa REAL,
  data TEXT
);

CREATE TABLE IF NOT EXISTS lgpd_consentimentos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT,
  tipo TEXT,
  status TEXT DEFAULT 'pendente',
  versao TEXT,
  data_solicitacao TEXT,
  data_resposta TEXT,
  ip_address TEXT,
  user_agent TEXT,
  documento_url TEXT
);

CREATE TABLE IF NOT EXISTS lgpd_politicas (
  id TEXT PRIMARY KEY,
  nome TEXT,
  versao TEXT,
  conteudo TEXT,
  obrigatoria INTEGER DEFAULT 0,
  data_publicacao TEXT,
  data_atualizacao TEXT
);

CREATE TABLE IF NOT EXISTS lgpd_pedidos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT,
  tipo TEXT,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  resposta TEXT,
  data_pedido TEXT,
  data_resposta TEXT,
  prazo_dias INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS auditoria_logs (
  id TEXT PRIMARY KEY,
  acao TEXT,
  entidade TEXT,
  entidade_id TEXT,
  usuario_id TEXT,
  detalhes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS timer_sessoes (
  id TEXT PRIMARY KEY,
  usuario_id TEXT,
  inicio TEXT,
  fim TEXT,
  duracao_segundos INTEGER DEFAULT 0,
  descricao TEXT,
  processo_id TEXT,
  cliente_id TEXT,
  tarefa_id TEXT,
  faturado INTEGER DEFAULT 0,
  running INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS configuracoes (
  usuario_id TEXT PRIMARY KEY,
  dados TEXT
);

CREATE INDEX IF NOT EXISTS idx_processos_cliente ON processos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_prazos_processo ON prazos(processo_id);
CREATE INDEX IF NOT EXISTS idx_prazos_data ON prazos(data_fim);
CREATE INDEX IF NOT EXISTS idx_tarefas_processo ON tarefas(processo_id);
CREATE INDEX IF NOT EXISTS idx_horas_processo ON horas(processo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_processo ON documentos(processo_id);
CREATE INDEX IF NOT EXISTS idx_faturas_cliente ON faturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_chat_mensagens_canal ON chat_mensagens(canal_id);
CREATE INDEX IF NOT EXISTS idx_portal_mensagens_processo ON portal_mensagens(processo_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria_logs(entidade, entidade_id);
`

db.exec(SCHEMA)

// ---- Helpers ----

const tableCols = new Map()
export function cols(table) {
  if (!tableCols.has(table)) {
    tableCols.set(
      table,
      db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name)
    )
  }
  return tableCols.get(table)
}

export function rowToJson(row, cfg = {}) {
  if (!row) return row
  const out = { ...row }
  for (const f of cfg.json || []) {
    if (out[f] != null && typeof out[f] === 'string') {
      try {
        out[f] = JSON.parse(out[f])
      } catch {
        /* keep as-is */
      }
    }
  }
  for (const f of cfg.bools || []) {
    if (out[f] != null) out[f] = !!out[f]
  }
  return out
}

export function bodyToRow(body, table, cfg = {}) {
  const allowed = new Set(cols(table))
  const out = {}
  for (const [k, v] of Object.entries(body || {})) {
    if (!allowed.has(k)) continue
    if ((cfg.json || []).includes(k)) {
      out[k] = v == null ? null : JSON.stringify(v)
    } else if ((cfg.bools || []).includes(k)) {
      out[k] = v ? 1 : 0
    } else {
      out[k] = v
    }
  }
  return out
}
