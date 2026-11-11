import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Clock,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useProcessosStore } from '../stores/processosStore'
import { usePrazosStore } from '../stores/prazosStore'
import { useHorasStore } from '../stores/horasStore'
import { formatarData, formatarMoeda, calcularCorPrioridade } from '../lib/utils'
import type { Prazo } from '../types'

export function DashboardPage() {
  const { processos } = useProcessosStore()
  const { prazos, concluirPrazo } = usePrazosStore()
  const { horas } = useHorasStore()
  const [horasFaturadas, setHorasFaturadas] = useState(0)

  useEffect(() => {
    const total = horas
      .filter((h) => h.faturavel)
      .reduce((acc, h) => acc + (h.duracao_minutos / 60) * (h.valor_hora || 0), 0)
    setHorasFaturadas(total)
  }, [horas])

  const processosAtivos = processos.filter((p) => p.status === 'ativo').length
  const prazosUrgentes = prazos.filter((p) => p.prioridade === 'urgente' && !p.concluido).length

  const totalMinutos = horas.reduce((acc, h) => acc + h.duracao_minutos, 0)
  const totalMinutosFaturaveis = horas
    .filter((h) => h.faturavel)
    .reduce((acc, h) => acc + h.duracao_minutos, 0)
  const produtividade = totalMinutos > 0
    ? Math.round((totalMinutosFaturaveis / totalMinutos) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do escritório
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Casos Ativos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Processos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prazos Críticos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{prazosUrgentes}</div>
            <p className="text-xs text-muted-foreground">
              Prazos urgentes para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Horas Faturadas
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(horasFaturadas)}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtividade
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{produtividade}%</div>
            <p className="text-xs text-muted-foreground">
              Horas faturáveis vs total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos Prazos</CardTitle>
                <CardDescription>Prazos dos próximos 7 dias</CardDescription>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prazos.slice(0, 5).map((prazo: Prazo) => (
                <div
                  key={prazo.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{prazo.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {prazo.processo?.numero} - {prazo.processo?.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatarData(prazo.data_fim)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={calcularCorPrioridade(prazo.prioridade)}>
                      {prazo.prioridade}
                    </Badge>
                    {!prazo.concluido ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => concluirPrazo(prazo.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/calendario">
                <Button variant="ghost" className="w-full">
                  Ver todos os prazos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Horas Trabalhadas</CardTitle>
                <CardDescription>Últimas atividades registadas</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {horas.slice(0, 5).map((hora) => (
                <div
                  key={hora.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{hora.atividade}</p>
                    <p className="text-sm text-muted-foreground">
                      {hora.duracao_minutos} minutos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hora.faturavel && (
                      <Badge variant="outline">Faturável</Badge>
                    )}
                    <span className="text-sm font-medium">
                      {formatarMoeda((hora.duracao_minutos / 60) * (hora.valor_hora || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/processos">
                <Button variant="ghost" className="w-full">
                  Ver todos os processos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
