import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, cols, rowToJson, bodyToRow } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET =
  process.env.JWT_SECRET || 'processum-dev-secret-mude-em-producao'
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads')
const DIST_DIR = path.join(__dirname, '..', 'dist')

fs.mkdirSync(UPLOADS_DIR, { recursive: true })

if (!process.env.JWT_SECRET) {
  console.warn('[Processum] JWT_SECRET não definido — a usar segredo de desenvolvimento.')
}

const app = express()
app.use(express.json({ limit: '25mb' }))

app.get('/api/health', (_req, res) => {
  try {
    db.prepare('SELECT 1').get()
    res.json({ ok: true, db: 'up' })
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

// ---------- Auth ----------

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, perfil: user.perfil, nome: user.nome },
    JWT_SECRET,
    { expiresIn: '12h' }
  )
}

function publicUser(u) {
  if (!u) return u
  const { password_hash, ...rest } = u
  return rest
}

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ erro: 'Não autenticado' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada' })
  }
}

function portalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ erro: 'Não autenticado' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.tipo !== 'cliente') throw new Error('tipo inválido')
    req.portal = payload
    next()
  } catch {
    res.status(401).json({ erro: 'Sessão inválida' })
  }
}

function audit(req, acao, entidade, entidade_id, detalhes = {}) {
  try {
    db.prepare(
      `INSERT INTO auditoria_logs (id, acao, entidade, entidade_id, usuario_id, detalhes, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      acao,
      entidade,
      entidade_id,
      req.user?.sub || null,
      JSON.stringify(detalhes),
      req.ip,
      req.headers['user-agent'] || '',
      new Date().toISOString()
    )
  } catch (e) {
    console.error('audit falhou:', e.message)
  }
}

function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n
  if (count > 0) return
  const now = new Date().toISOString()
  const hash = bcrypt.hashSync('123456', 10)
  const insert = db.prepare(
    `INSERT INTO usuarios (id, email, nome, perfil, oab, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
  insert.run('1', 'socio@escritorio.pt', 'Dr. João Silva', 'socio', '12345', hash, now)
  insert.run('2', 'advogado@escritorio.pt', 'Dra. Maria Santos', 'advogado', '12346', hash, now)
  insert.run('3', 'estagiario@escritorio.pt', 'Pedro Costa', 'estagiario', null, hash, now)
  console.log('[Processum] Utilizadores iniciais criados (password: 123456).')
}

function seedPortal() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM portal_acessos').get().n
  if (count > 0) return
  const now = new Date().toISOString()
  const hash = bcrypt.hashSync('123456', 10)
  const insert = db.prepare(
    `INSERT INTO portal_acessos (id, cliente_id, email, password_hash, ativo, ultimo_acesso, created_at) VALUES (?, ?, ?, ?, 1, NULL, ?)`
  )
  insert.run('1', '1', 'geral@empresaabc.pt', hash, now)
  insert.run('2', '2', 'joao.ferreira@email.pt', hash, now)
}
seedPortal()

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email || '')
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ erro: 'Credenciais inválidas' })
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/register', (req, res) => {
  const { email, nome, password, firmName } = req.body || {}
  if (!email || !nome || !password) {
    return res.status(400).json({ erro: 'Email, nome e palavra-passe são obrigatórios' })
  }
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email)
  if (exists) return res.status(409).json({ erro: 'Email já registado' })
  const user = {
    id: crypto.randomUUID(),
    email,
    nome,
    perfil: 'socio', // primeiro registo = administrador do escritório
    oab: null,
    password_hash: bcrypt.hashSync(password, 10),
    created_at: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO usuarios (id, email, nome, perfil, oab, password_hash, created_at) VALUES (@id, @email, @nome, @perfil, @oab, @password_hash, @created_at)`
  ).run({ ...user, oab: firmName ? null : null })
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/accept-invite', (req, res) => {
  const { token, nome, password } = req.body || {}
  const convite = db
    .prepare(`SELECT * FROM convites WHERE token = ? AND status = 'pendente'`)
    .get(token || '')
  if (!convite) return res.status(404).json({ erro: 'Convite inválido ou já utilizado' })
  if (!password || password.length < 6) {
    return res.status(400).json({ erro: 'Palavra-passe deve ter pelo menos 6 caracteres' })
  }
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(convite.email)
  if (exists) return res.status(409).json({ erro: 'Já existe uma conta com este email' })
  const user = {
    id: crypto.randomUUID(),
    email: convite.email,
    nome: nome || convite.email,
    perfil: convite.perfil,
    oab: null,
    password_hash: bcrypt.hashSync(password, 10),
    created_at: new Date().toISOString(),
  }
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO usuarios (id, email, nome, perfil, oab, password_hash, created_at) VALUES (@id, @email, @nome, @perfil, @oab, @password_hash, @created_at)`
    ).run(user)
    db.prepare(`UPDATE convites SET status = 'aceite' WHERE id = ?`).run(convite.id)
  })
  tx()
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.user.sub)
  res.json(publicUser(user))
})

// ---------- Generic CRUD ----------

// config: { json: [...], bools: [...], audit: 'nome_entidade' }
const TABLES = {
  usuarios: {},
  convites: {},
  clientes: { audit: 'cliente' },
  processos: { audit: 'processo' },
  prazos: { bools: ['concluido'], audit: 'prazo' },
  tarefas: { json: ['etiquetas'], audit: 'tarefa' },
  horas: { bools: ['faturavel'] },
  documentos: {},
  faturas: { json: ['itens'], audit: 'fatura' },
  despesas: {},
  comunicacoes: {},
  templates_comunicacao: { json: ['variaveis'] },
  agendamentos: { json: ['notificacoes_enviadas'] },
  orcamentos: { json: ['itens'], audit: 'orcamento' },
  retainers: { bools: ['alerta_80', 'alerta_100'], json: ['faturas'] },
  conflitos_partes: { bools: ['alerta_conflito'], json: ['contato'] },
  conflitos_relacoes: {},
  conflitos_detectados: { json: ['partes_envolvidas'] },
  departamentos: { bools: ['ativo'], json: ['metas'] },
  trust_contas: {},
  trust_movimentacoes: {},
  trust_reconciliacoes: {},
  wiki_artigos: { json: ['tags'] },
  wiki_faqs: {},
  chat_canais: { json: ['participantes'] },
  chat_mensagens: {},
  portal_acessos: { bools: ['ativo'] },
  portal_mensagens: { bools: ['lida'] },
  marketing_campanhas: { json: ['segmento', 'estatisticas'] },
  marketing_nps: { bools: ['responded'] },
  marketing_referrals: {},
  lgpd_consentimentos: {},
  lgpd_politicas: { bools: ['obrigatoria'] },
  lgpd_pedidos: {},
  auditoria_logs: { json: ['detalhes'] },
  timer_sessoes: { bools: ['faturado', 'running'] },
}

function crud(table, cfg) {
  const r = express.Router()
  const selectAll = db.prepare(`SELECT * FROM ${table}`)
  const selectOne = db.prepare(`SELECT * FROM ${table} WHERE id = ?`)
  const deleteOne = db.prepare(`DELETE FROM ${table} WHERE id = ?`)

  r.get('/', (_req, res) => {
    res.json(selectAll.all().map((row) => rowToJson(row, cfg)))
  })

  r.get('/:id', (req, res) => {
    const row = selectOne.get(req.params.id)
    if (!row) return res.status(404).json({ erro: 'Não encontrado' })
    res.json(rowToJson(row, cfg))
  })

  r.post('/', (req, res) => {
    const data = bodyToRow(req.body, table, cfg)
    if (!data.id) data.id = crypto.randomUUID()
    const now = new Date().toISOString()
    const colList = cols(table)
    if (colList.includes('created_at') && !data.created_at) data.created_at = now
    if (colList.includes('updated_at') && !data.updated_at) data.updated_at = now
    if (table === 'usuarios') delete data.password_hash
    const keys = Object.keys(data)
    try {
      db.prepare(
        `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((k) => '@' + k).join(',')})`
      ).run(data)
    } catch (e) {
      return res.status(400).json({ erro: e.message })
    }
    if (cfg.audit) audit(req, 'criar', cfg.audit, data.id, data)
    res.status(201).json(rowToJson(selectOne.get(data.id), cfg))
  })

  r.put('/:id', (req, res) => {
    const data = bodyToRow(req.body, table, cfg)
    delete data.id
    const keys = Object.keys(data)
    if (keys.length === 0) return res.json(rowToJson(selectOne.get(req.params.id), cfg))
    try {
      const info = db
        .prepare(`UPDATE ${table} SET ${keys.map((k) => `${k} = @${k}`).join(', ')} WHERE id = @__id`)
        .run({ ...data, __id: req.params.id })
      if (info.changes === 0) return res.status(404).json({ erro: 'Não encontrado' })
    } catch (e) {
      return res.status(400).json({ erro: e.message })
    }
    if (cfg.audit) audit(req, 'atualizar', cfg.audit, req.params.id, data)
    res.json(rowToJson(selectOne.get(req.params.id), cfg))
  })

  r.delete('/:id', (req, res) => {
    const info = deleteOne.run(req.params.id)
    if (info.changes === 0) return res.status(404).json({ erro: 'Não encontrado' })
    if (cfg.audit) audit(req, 'eliminar', cfg.audit, req.params.id, {})
    res.json({ ok: true })
  })

  return r
}

// usuarios: expõe lista sem hashes
app.get('/api/usuarios', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM usuarios').all().map(publicUser))
})
for (const [table, cfg] of Object.entries(TABLES)) {
  if (table === 'usuarios' || table === 'documentos') continue
  app.use(`/api/${table}`, auth, crud(table, cfg))
}

// documentos: CRUD manual (DELETE também remove o ficheiro)
app.get('/api/documentos', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM documentos').all())
})
app.get('/api/documentos/meta/:id', auth, (req, res) => {
  const doc = db.prepare('SELECT * FROM documentos WHERE id = ?').get(req.params.id)
  if (!doc) return res.status(404).json({ erro: 'Documento não encontrado' })
  res.json(doc)
})
app.post('/api/documentos', auth, (req, res) => {
  const data = bodyToRow(req.body, 'documentos', TABLES.documentos)
  if (!data.id) data.id = crypto.randomUUID()
  if (!data.created_at) data.created_at = new Date().toISOString()
  const keys = Object.keys(data)
  db.prepare(`INSERT INTO documentos (${keys.join(',')}) VALUES (${keys.map((k) => '@' + k).join(',')})`).run(data)
  res.status(201).json(db.prepare('SELECT * FROM documentos WHERE id = ?').get(data.id))
})
app.put('/api/documentos/:id', auth, (req, res) => {
  const data = bodyToRow(req.body, 'documentos', TABLES.documentos)
  delete data.id
  const keys = Object.keys(data)
  if (keys.length) {
    db.prepare(`UPDATE documentos SET ${keys.map((k) => `${k} = @${k}`).join(', ')} WHERE id = @__id`).run({
      ...data,
      __id: req.params.id,
    })
  }
  res.json(db.prepare('SELECT * FROM documentos WHERE id = ?').get(req.params.id))
})
app.put('/api/usuarios/:id', auth, (req, res) => {
  const allowed = ['nome', 'email', 'perfil', 'oab']
  const data = {}
  for (const k of allowed) if (k in (req.body || {})) data[k] = req.body[k]
  const keys = Object.keys(data)
  if (keys.length) {
    db.prepare(`UPDATE usuarios SET ${keys.map((k) => `${k} = @${k}`).join(', ')} WHERE id = @__id`).run({
      ...data,
      __id: req.params.id,
    })
  }
  res.json(publicUser(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id)))
})
app.delete('/api/usuarios/:id', auth, (req, res) => {
  if (req.params.id === req.user.sub) return res.status(400).json({ erro: 'Não pode remover a sua própria conta' })
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// convites (com token para /accept-invite)
app.post('/api/convites/gerar', auth, (req, res) => {
  const { email, perfil } = req.body || {}
  if (!email || !perfil) return res.status(400).json({ erro: 'Email e perfil obrigatórios' })
  const convite = {
    id: crypto.randomUUID(),
    email,
    perfil,
    token: crypto.randomUUID(),
    status: 'pendente',
    created_at: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO convites (id, email, perfil, token, status, created_at) VALUES (@id, @email, @perfil, @token, @status, @created_at)`
  ).run(convite)
  res.status(201).json(convite)
})

// ---------- Bootstrap (seed inicial a partir do cliente, só em tabelas vazias) ----------

app.post('/api/bootstrap', auth, (req, res) => {
  const payload = req.body || {}
  const inserted = {}
  const tx = db.transaction(() => {
    for (const [table, cfg] of Object.entries(TABLES)) {
      const rows = payload[table]
      if (!Array.isArray(rows) || rows.length === 0) continue
      const isEmpty = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n === 0
      if (!isEmpty) continue
      const colList = cols(table)
      for (const row of rows) {
        const data = bodyToRow(row, table, cfg)
        if (!data.id) data.id = crypto.randomUUID()
        const now = new Date().toISOString()
        for (const c of colList) {
          if (!(c in data)) {
            if (c === 'created_at' || c === 'updated_at') data[c] = now
          }
        }
        const keys = Object.keys(data)
        try {
          db.prepare(
            `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((k) => '@' + k).join(',')})`
          ).run(data)
          inserted[table] = (inserted[table] || 0) + 1
        } catch (e) {
          console.error(`bootstrap ${table}:`, e.message)
        }
      }
    }
  })
  tx()
  res.json({ inserted })
})

// ---------- Configurações por utilizador ----------

app.get('/api/configuracoes', auth, (req, res) => {
  const row = db.prepare('SELECT dados FROM configuracoes WHERE usuario_id = ?').get(req.user.sub)
  res.json(row ? JSON.parse(row.dados) : {})
})
app.put('/api/configuracoes', auth, (req, res) => {
  db.prepare(
    `INSERT INTO configuracoes (usuario_id, dados) VALUES (?, ?)
     ON CONFLICT(usuario_id) DO UPDATE SET dados = excluded.dados`
  ).run(req.user.sub, JSON.stringify(req.body || {}))
  res.json({ ok: true })
})

// ---------- Departamento membros (chave composta) ----------

app.get('/api/departamento_membros', auth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM departamento_membros').all())
})
app.post('/api/departamento_membros', auth, (req, res) => {
  const { usuario_id, departamento_id, data_entrada, cargo } = req.body || {}
  db.prepare(
    `INSERT INTO departamento_membros (usuario_id, departamento_id, data_entrada, cargo) VALUES (?, ?, ?, ?)
     ON CONFLICT(usuario_id, departamento_id) DO UPDATE SET cargo = excluded.cargo`
  ).run(usuario_id, departamento_id, data_entrada || new Date().toISOString(), cargo || '')
  res.json({ ok: true })
})
app.delete('/api/departamento_membros/:usuario_id/:departamento_id', auth, (req, res) => {
  db.prepare('DELETE FROM departamento_membros WHERE usuario_id = ? AND departamento_id = ?').run(
    req.params.usuario_id,
    req.params.departamento_id
  )
  res.json({ ok: true })
})

// ---------- Chat leituras ----------

app.get('/api/chat_leituras', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM chat_leituras WHERE usuario_id = ?').all(req.user.sub))
})
app.post('/api/chat_leituras', auth, (req, res) => {
  const { canal_id, timestamp } = req.body || {}
  db.prepare(
    `INSERT INTO chat_leituras (canal_id, usuario_id, timestamp) VALUES (?, ?, ?)
     ON CONFLICT(canal_id, usuario_id) DO UPDATE SET timestamp = excluded.timestamp`
  ).run(canal_id, req.user.sub, timestamp || new Date().toISOString())
  res.json({ ok: true })
})

// ---------- Trust accounting (transações) ----------

function novaMovimentacao(conta_id, tipo, valor, descricao, created_by, extra = {}) {
  const conta = db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(conta_id)
  const saldo_apos = conta.saldo
  db.prepare(
    `INSERT INTO trust_movimentacoes (id, conta_id, tipo, valor, descricao, processo_id, fatura_id, referencia, data_movimentacao, saldo_apos, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    conta_id,
    tipo,
    valor,
    descricao || '',
    extra.processo_id || null,
    extra.fatura_id || null,
    extra.referencia || null,
    new Date().toISOString(),
    saldo_apos,
    created_by
  )
}

app.post('/api/trust/deposito', auth, (req, res) => {
  const { conta_id, valor, descricao } = req.body || {}
  const conta = db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(conta_id)
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' })
  const tx = db.transaction(() => {
    db.prepare('UPDATE trust_contas SET saldo = saldo + ? WHERE id = ?').run(valor, conta_id)
    novaMovimentacao(conta_id, 'deposito', valor, descricao, req.user.sub)
  })
  tx()
  res.json(db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(conta_id))
})

app.post('/api/trust/levantamento', auth, (req, res) => {
  const { conta_id, valor, descricao } = req.body || {}
  const conta = db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(conta_id)
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' })
  if (conta.saldo < valor) return res.status(400).json({ erro: 'Saldo insuficiente' })
  const tx = db.transaction(() => {
    db.prepare('UPDATE trust_contas SET saldo = saldo - ? WHERE id = ?').run(valor, conta_id)
    novaMovimentacao(conta_id, 'levantamento', valor, descricao, req.user.sub)
  })
  tx()
  res.json(db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(conta_id))
})

app.post('/api/trust/transferencia', auth, (req, res) => {
  const { origem_id, destino_id, valor, descricao } = req.body || {}
  const origem = db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(origem_id)
  const destino = db.prepare('SELECT * FROM trust_contas WHERE id = ?').get(destino_id)
  if (!origem || !destino) return res.status(404).json({ erro: 'Conta não encontrada' })
  if (origem.saldo < valor) return res.status(400).json({ erro: 'Saldo insuficiente' })
  const tx = db.transaction(() => {
    db.prepare('UPDATE trust_contas SET saldo = saldo - ? WHERE id = ?').run(valor, origem_id)
    db.prepare('UPDATE trust_contas SET saldo = saldo + ? WHERE id = ?').run(valor, destino_id)
    novaMovimentacao(origem_id, 'transferencia', valor, descricao, req.user.sub)
    novaMovimentacao(destino_id, 'transferencia', valor, descricao, req.user.sub)
  })
  tx()
  res.json({ ok: true })
})

// ---------- Documentos: upload/download ----------

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-À-ÿ ]/g, '_')
      req.docId = crypto.randomUUID()
      cb(null, `${req.docId}-${safe}`)
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
})

function docFilePath(doc) {
  const file = fs.readdirSync(UPLOADS_DIR).find((f) => f.startsWith(`${doc.id}-`))
  return file ? path.join(UPLOADS_DIR, file) : null
}

app.post('/api/documentos/upload', auth, upload.single('ficheiro'), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Ficheiro em falta' })
  const doc = {
    id: req.docId,
    nome: req.file.originalname,
    tipo: req.file.mimetype,
    tamanho: req.file.size,
    url: `/api/documentos/${req.docId}/download`,
    processo_id: req.body.processo_id || null,
    cliente_id: req.body.cliente_id || null,
    uploaded_by: req.user.sub,
    versao: 1,
    created_at: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO documentos (id, nome, tipo, tamanho, url, processo_id, cliente_id, uploaded_by, versao, created_at)
     VALUES (@id, @nome, @tipo, @tamanho, @url, @processo_id, @cliente_id, @uploaded_by, @versao, @created_at)`
  ).run(doc)
  audit(req, 'criar', 'documento', doc.id, { nome: doc.nome })
  res.status(201).json(doc)
})

app.get('/api/documentos/:id/download', auth, (req, res) => {
  const doc = db.prepare('SELECT * FROM documentos WHERE id = ?').get(req.params.id)
  if (!doc) return res.status(404).json({ erro: 'Documento não encontrado' })
  const full = docFilePath(doc)
  if (!full || !fs.existsSync(full)) return res.status(404).json({ erro: 'Ficheiro não existe no disco' })
  res.download(full, doc.nome)
})

const docDelete = db.prepare('DELETE FROM documentos WHERE id = ?')
app.delete('/api/documentos/:id', auth, (req, res) => {
  const doc = db.prepare('SELECT * FROM documentos WHERE id = ?').get(req.params.id)
  if (!doc) return res.status(404).json({ erro: 'Documento não encontrado' })
  const full = docFilePath(doc)
  if (full && fs.existsSync(full)) fs.unlinkSync(full)
  docDelete.run(req.params.id)
  audit(req, 'eliminar', 'documento', req.params.id, { nome: doc.nome })
  res.json({ ok: true })
})

// ---------- Portal do Cliente ----------

app.post('/api/portal/login', (req, res) => {
  const { email, password } = req.body || {}
  const acesso = db
    .prepare(`SELECT * FROM portal_acessos WHERE email = ? AND ativo = 1`)
    .get(email || '')
  if (!acesso || !bcrypt.compareSync(password || '', acesso.password_hash)) {
    return res.status(401).json({ erro: 'Credenciais inválidas' })
  }
  db.prepare('UPDATE portal_acessos SET ultimo_acesso = ? WHERE id = ?').run(
    new Date().toISOString(),
    acesso.id
  )
  const token = jwt.sign(
    { tipo: 'cliente', sub: acesso.id, cliente_id: acesso.cliente_id, email: acesso.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  )
  const { password_hash, ...pub } = acesso
  res.json({ token, acesso: pub })
})

app.post('/api/portal/acessos', auth, (req, res) => {
  const { cliente_id, email, password } = req.body || {}
  if (!cliente_id || !email || !password) {
    return res.status(400).json({ erro: 'cliente_id, email e password obrigatórios' })
  }
  const acesso = {
    id: crypto.randomUUID(),
    cliente_id,
    email,
    password_hash: bcrypt.hashSync(password, 10),
    ativo: 1,
    ultimo_acesso: null,
    created_at: new Date().toISOString(),
  }
  try {
    db.prepare(
      `INSERT INTO portal_acessos (id, cliente_id, email, password_hash, ativo, ultimo_acesso, created_at)
       VALUES (@id, @cliente_id, @email, @password_hash, @ativo, @ultimo_acesso, @created_at)`
    ).run(acesso)
  } catch (e) {
    return res.status(400).json({ erro: e.message })
  }
  const { password_hash, ...pub } = acesso
  res.status(201).json(pub)
})

app.get('/api/portal/processos', portalAuth, (req, res) => {
  res.json(
    db.prepare('SELECT * FROM processos WHERE cliente_id = ?').all(req.portal.cliente_id)
  )
})
app.get('/api/portal/documentos', portalAuth, (req, res) => {
  res.json(
    db.prepare('SELECT * FROM documentos WHERE cliente_id = ?').all(req.portal.cliente_id)
  )
})
app.get('/api/portal/me', portalAuth, (req, res) => {
  const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.portal.cliente_id)
  if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' })
  res.json(cliente)
})

app.get('/api/portal/faturas', portalAuth, (req, res) => {
  const faturas = db
    .prepare('SELECT * FROM faturas WHERE cliente_id = ?')
    .all(req.portal.cliente_id)
    .map((f) => rowToJson(f, TABLES.faturas))
  res.json(faturas)
})

app.get('/api/convites/info/:token', (req, res) => {
  const convite = db
    .prepare('SELECT email, perfil, status FROM convites WHERE token = ?')
    .get(req.params.token)
  if (!convite) return res.status(404).json({ erro: 'Convite não encontrado' })
  res.json(convite)
})

app.get('/api/portal/mensagens', portalAuth, (req, res) => {
  const processos = db
    .prepare('SELECT id FROM processos WHERE cliente_id = ?')
    .all(req.portal.cliente_id)
    .map((p) => p.id)
  if (processos.length === 0) return res.json([])
  const marks = processos.map(() => '?').join(',')
  res.json(
    db.prepare(`SELECT * FROM portal_mensagens WHERE processo_id IN (${marks})`).all(...processos)
  )
})
app.post('/api/portal/mensagens', portalAuth, (req, res) => {
  const { processo_id, mensagem } = req.body || {}
  const processo = db
    .prepare('SELECT * FROM processos WHERE id = ? AND cliente_id = ?')
    .get(processo_id, req.portal.cliente_id)
  if (!processo) return res.status(403).json({ erro: 'Processo não pertence ao cliente' })
  const msg = {
    id: crypto.randomUUID(),
    processo_id,
    remetente: 'cliente',
    autor_id: req.portal.sub,
    autor_nome: req.portal.email,
    mensagem,
    arquivo_url: null,
    data_envio: new Date().toISOString(),
    lida: 0,
  }
  db.prepare(
    `INSERT INTO portal_mensagens (id, processo_id, remetente, autor_id, autor_nome, mensagem, arquivo_url, data_envio, lida)
     VALUES (@id, @processo_id, @remetente, @autor_id, @autor_nome, @mensagem, @arquivo_url, @data_envio, @lida)`
  ).run(msg)
  res.status(201).json(msg)
})

// ---------- Static ----------

app.use('/api', (_req, res) => res.status(404).json({ erro: 'Endpoint não encontrado' }))

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[Processum] API + app em http://localhost:${PORT}`)
})
