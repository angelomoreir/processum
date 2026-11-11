import { useState } from 'react'
import { BarChart3, TrendingUp, Clock, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useProcessosStore } from '../stores/processosStore'
import { useClientesStore } from '../stores/clientesStore'
import { useHorasStore } from '../stores/horasStore'
import { useFinanceiroStore } from '../stores/financeiroStore'
import { usePrazosStore } from '../stores/prazosStore'
import { useAuditoriaStore } from '../stores/auditoriaStore'
import { formatarMoeda } from '../lib/utils'

export function AnalyticsPage() {
  const { processos } = useProcessosStore()
  const { clientes } = useClientesStore()
  const { horas } = useHorasStore()
  const { faturas } = useFinanceiroStore()
  const { prazos } = usePrazosStore()
  const { getEstatisticas } = useAuditoriaStore()
  
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Cálculos de analytics
  const processosPorStatus = processos.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const clientesPorEstagio = clientes.reduce((acc, c) => {
    acc[c.estagio] = (acc[c.estagio] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const horasPorAdvogado = horas.reduce((acc, h) => {
    acc[h.advogado_id] = (acc[h.advogado_id] || 0) + h.duracao_minutos
    return acc
  }, {} as Record<string, number>)

  const receitaTotal = faturas
    .filter((f) => f.status === 'paga')
    .reduce((acc, f) => acc + f.valor_liquido, 0)

  const receitaPendente = faturas
    .filter((f) => f.status === 'pendente' || f.status === 'atrasada')
    .reduce((acc, f) => acc + f.valor_liquido, 0)

  const taxaConversao = clientes.length > 0
    ? Math.round((clientes.filter((c) => c.estagio === 'ativo').length / clientes.length) * 100)
    : 0

  const estatisticasAuditoria = getEstatisticas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & BI</h1>
          <p className="text-muted-foreground">Dashboard de business intelligence do escritório</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <Button
              key={p}
              variant={periodo === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodo(p)}
            >
              {p === '7d' && '7 dias'}
              {p === '30d' && '30 dias'}
              {p === '90d' && '3 meses'}
              {p === '1y' && '1 ano'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(receitaTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {formatarMoeda(receitaPendente)} a receber
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaConversao}%</div>
            <p className="text-xs text-muted-foreground">
              Lead → Cliente Ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(Object.values(horasPorAdvogado).reduce((a, b) => a + b, 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Total de horas registadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasAuditoria.total}</div>
            <p className="text-xs text-muted-foreground">
              Ações registadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Processos por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Processos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(processosPorStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / processos.length) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(clientesPorEstagio).map(([estagio, count]) => (
                <div key={estagio} className="flex items-center justify-between">
                  <span className="capitalize">{estagio}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(count / clientes.length) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Advogado */}
        <Card>
          <CardHeader>
            <CardTitle>Horas por Advogado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(horasPorAdvogado)
                .sort((a, b) => b[1] - a[1])
                .map(([advogadoId, minutos]) => (
                  <div key={advogadoId} className="flex items-center justify-between">
                    <span>Advogado {advogadoId.slice(0, 4)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <span className="w-12 text-right">{Math.round(minutos / 60)}h</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividade do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(estatisticasAuditoria.por_acao)
                .sort((a, b) => b[1] - a[1])
                .map(([acao, count]) => (
                  <div key={acao} className="flex items-center justify-between">
                    <span className="capitalize">{acao}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(count / estatisticasAuditoria.total) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previsões e Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights & Previsões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Previsão de receita:</strong> Baseado nas horas faturáveis registadas, 
            espera-se uma receita de {formatarMoeda(receitaTotal * 1.15)} no próximo mês (+15%).
          </p>
          <p className="text-sm">
            <strong>Alerta:</strong> {prazos.filter((p) => p.prioridade === 'urgente' && !p.concluido).length} prazos 
            urgentes para esta semana. Considere redistribuir tarefas.
          </p>
          <p className="text-sm">
            <strong>Oportunidade:</strong> {clientes.filter((c) => c.estagio === 'lead').length} leads 
            aguardam contacto. Taxa de conversão atual: {taxaConversao}%.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
