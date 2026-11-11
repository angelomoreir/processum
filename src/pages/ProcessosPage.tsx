import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Calendar, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { ModalProcesso } from '../components/modais/ModalProcesso'
import { useProcessosStore } from '../stores/processosStore'
import { formatarData } from '../lib/utils'
import type { Processo, StatusProcesso } from '../types'

const STATUS_COLORS: Record<StatusProcesso, string> = {
  ativo: 'bg-emerald-100 text-emerald-800',
  arquivado: 'bg-gray-100 text-gray-800',
  concluido: 'bg-blue-100 text-blue-800',
  suspenso: 'bg-yellow-100 text-yellow-800',
}

const STATUS_LABELS: Record<StatusProcesso, string> = {
  ativo: 'Ativo',
  arquivado: 'Arquivado',
  concluido: 'Concluído',
  suspenso: 'Suspenso',
}

export function ProcessosPage() {
  const { processos } = useProcessosStore()
  const [filtro, setFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [processoEditando, setProcessoEditando] = useState<Processo | null>(null)

  const processosFiltrados = processos.filter((processo) => {
    const matchFiltro =
      processo.numero.toLowerCase().includes(filtro.toLowerCase()) ||
      processo.descricao.toLowerCase().includes(filtro.toLowerCase()) ||
      processo.cliente?.nome.toLowerCase().includes(filtro.toLowerCase())
    const matchStatus = statusFiltro === 'todos' || processo.status === statusFiltro
    return matchFiltro && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
          <p className="text-muted-foreground">
            Gestão de casos e processos judiciais
          </p>
        </div>
        <Button onClick={() => {
          setProcessoEditando(null)
          setModalAberto(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar processos..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="suspenso">Suspenso</option>
              <option value="concluido">Concluído</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processosFiltrados.map((processo) => (
              <Link
                key={processo.id}
                to={`/processos/${processo.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {processo.numero} - {processo.descricao}
                      </h3>
                      <Badge className={STATUS_COLORS[processo.status]}>
                        {STATUS_LABELS[processo.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Cliente: {processo.cliente?.nome}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Advogado: {processo.advogado_responsavel?.nome}
                      </span>
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Abertura: {formatarData(processo.data_abertura)}
                      </span>
                      {processo.tribunal && (
                        <span>• {processo.tribunal}</span>
                      )}
                      {processo.valor_causa && processo.valor_causa > 0 && (
                        <span>• Valor: {processo.valor_causa.toLocaleString('pt-PT')} €</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Área: {processo.area_direito}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      <ModalProcesso
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        processo={processoEditando}
      />
    </div>
  )
}
