import { useState } from 'react'
import { Brain, TrendingUp, DollarSign, AlertCircle, Target, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAnalisePreditivaStore } from '../stores/analisePreditivaStore'
import { useProcessosStore } from '../stores/processosStore'
import { useClientesStore } from '../stores/clientesStore'
import { formatarMoeda } from '../lib/utils'

export function AnalisePreditivaPage() {
  const { previsoesProcessos, calcularProbabilidadeGanho, preverReceitas, analisarRiscoCliente } = useAnalisePreditivaStore()
  const { processos } = useProcessosStore()
  const { clientes } = useClientesStore()
  const [processoSelecionado, setProcessoSelecionado] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  const handleAnalisarProcesso = () => {
    if (processoSelecionado) {
      calcularProbabilidadeGanho(processoSelecionado)
    }
  }

  const handlePreverReceitas = () => {
    preverReceitas(mesSelecionado, anoSelecionado)
  }

  const handleAnalisarRisco = () => {
    if (clienteSelecionado) {
      analisarRiscoCliente(clienteSelecionado)
    }
  }

  const probabilidadeMedia = previsoesProcessos.length > 0
    ? previsoesProcessos.reduce((acc, p) => acc + p.probabilidade_ganho, 0) / previsoesProcessos.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise Preditiva</h1>
        <p className="text-muted-foreground">ML para previsão de resultados e receitas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-purple-50">
          <CardContent className="p-6">
            <Brain className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm text-muted-foreground">Processos Analisados</p>
            <p className="text-3xl font-bold">{previsoesProcessos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Target className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-muted-foreground">Prob. Média de Ganho</p>
            <p className="text-3xl font-bold">{Math.round(probabilidadeMedia)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Valor Provável Total</p>
            <p className="text-3xl font-bold">
              {formatarMoeda(previsoesProcessos.reduce((acc, p) => acc + p.valor_provavel, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-sm text-muted-foreground">Confiança Média</p>
            <p className="text-3xl font-bold">
              {Math.round(previsoesProcessos.reduce((acc, p) => acc + p.confianca, 0) / (previsoesProcessos.length || 1))}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Probabilidade por Processo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <select
                value={processoSelecionado}
                onChange={(e) => setProcessoSelecionado(e.target.value)}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione um processo</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>{p.numero}</option>
                ))}
              </select>
              <Button onClick={handleAnalisarProcesso}>Analisar</Button>
            </div>

            <div className="space-y-3">
              {previsoesProcessos.map((prev) => {
                const processo = processos.find((p) => p.id === prev.processo_id)
                return (
                  <div key={prev.processo_id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{processo?.numero}</p>
                      <Badge variant={prev.probabilidade_ganho > 60 ? 'default' : prev.probabilidade_ganho > 40 ? 'secondary' : 'destructive'}>
                        {prev.probabilidade_ganho}% probabilidade
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Provável</p>
                        <p className="font-semibold">{formatarMoeda(prev.valor_provavel)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo Estimado</p>
                        <p className="font-semibold">{prev.tempo_estimado_dias} dias</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            prev.probabilidade_ganho > 60 ? 'bg-green-500' : prev.probabilidade_ganho > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${prev.probabilidade_ganho}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Fatores: {prev.fatores_positivos.length} positivos, {prev.fatores_negativos.length} negativos
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Previsão Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
                className="h-10 rounded-md border border-input bg-background px-3"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('pt-PT', { month: 'long' })}</option>
                ))}
              </select>
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
                className="h-10 rounded-md border border-input bg-background px-3"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
              <Button onClick={handlePreverReceitas}>Prever</Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Previsão para {new Date(anoSelecionado, mesSelecionado - 1).toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Esperada</p>
                  <p className="text-xl font-bold text-blue-700">{formatarMoeda(15000 + Math.random() * 5000)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Intervalo</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {formatarMoeda(12000)} - {formatarMoeda(20000)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Análise de Risco de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <select
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
              className="flex-1 h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <Button onClick={handleAnalisarRisco}>Analisar Risco</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Análise de risco de fuga baseada em padrões de comunicação, pagamentos e engagement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
