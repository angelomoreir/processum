# Processum - Sistema de Gestão de Escritório

Sistema de gestão para escritórios de advocacia: clientes, processos, prazos, documentos, financeiro e muito mais — **com backend local (Node + SQLite)**. Corre 100% on-premises: os dados ficam no escritório (forte argumento RGPD).

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node + Express 5 + **SQLite** (`node:sqlite` built-in)
- **Estado**: Zustand (stores sincronizados com a API)
- **Auth**: JWT + bcrypt (bcryptjs)

## Como correr

### Desenvolvimento (2 terminais)

```bash
npm run server   # API em http://localhost:3001 (SQLite em server/data/)
npm run dev      # Vite em http://localhost:5173 (proxy /api -> :3001)
```

### Produção

```bash
npm run build    # gera dist/
npm start        # Express serve a app + API em http://localhost:3001
```

Variáveis de ambiente: `PORT` (3001), `JWT_SECRET` (definir em produção!), `DB_PATH`, `UPLOADS_DIR`, `DATA_DIR`.

## Credenciais de teste

| Perfil | Email | Palavra-passe |
|--------|-------|---------------|
| Sócio | socio@escritorio.pt | 123456 |
| Advogado | advogado@escritorio.pt | 123456 |
| Estagiário | estagiario@escritorio.pt | 123456 |
| Portal do Cliente | joao.ferreira@email.pt | 123456 |

## Arquitetura

```
server/
  index.js          # API Express (auth JWT, CRUD genérico, portal, trust, uploads)
  db.js             # Schema SQLite (~30 tabelas) + helpers
  data/processum.db # Base de dados (criada automaticamente)
  uploads/          # Ficheiros enviados
src/
  lib/api.ts        # Cliente HTTP + fetchOrSeed (seed automático em tabelas vazias)
  lib/sync.ts       # syncAll() — carrega todos os stores do servidor
  stores/           # Zustand: cache local + sync com API (métodos iguais aos anteriores)
  pages/            # 30+ páginas (CRM, processos, calendário, financeiro, portal, ...)
```

Os stores Zustand mantêm `persist` em localStorage como cache offline; `fetchAll()` carrega do servidor e faz **seed automático** dos dados demo na primeira execução (`POST /api/bootstrap`).

## Módulos

CRM clientes · Processos · Prazos/Calendário · Horas/Timer · Documentos (upload real) · Financeiro/Faturas/Despesas · Orçamentos/Retainers · Trust Accounting (transacional) · Kanban tarefas · Comunicações/templates · Chat interno · Wiki · Auditoria · Equipa/Convites · Departamentos · Conflitos de interesses · Portal do Cliente (login próprio) · Marketing CRM · LGPD · Configurações · Assinatura · Integrações (simuladas: Citius, DGSI, MBWay, etc.) · Assistente AI (regras locais) · Gamificação · Análise Preditiva (heurísticas)

Nota: Integrações externas (Citius, DGSI, MBWay, LinkedIn) e o assistente AI são simuladores locais — precisam de credenciais/APIs reais para produção.
