import { useEffect, useState } from 'react'
import { Play, Pause, Square, Clock, History, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useTimerStore } from '../stores/timerStore'
import { useProcessosStore } from '../stores/processosStore'
import { useHorasStore } from '../stores/horasStore'
import { useAuthStore } from '../stores/authStore'

export function TimerPage() {
  const { sessaoAtiva, iniciarTimer, pausarTimer, retomarTimer, pararTimer, getTempoFormatado, getSessoesHoje, getTempoTotalHoje, sugerirRegisto } = useTimerStore()
  const { processos } = useProcessosStore()
  const { addHora } = useHorasStore()
  const { user } = useAuthStore()
  
  const [descricao, setDescricao] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [sugestao, setSugestao] = useState<{ processo_id?: string; confianca: number } | null>(null)

  useEffect(() => {
    const sug = sugerirRegisto()
    if (sug) setSugestao(sug)
  }, [])

  const handleIniciar = () => {
    iniciarTimer({
      descricao,
      processo_id: processoId,
      responsavel_id: user?.id || '',
    })
  }

  const handleParar = () => {
    const sessao = pararTimer()
    if (sessao && user) {
      // Converte segundos para minutos e adiciona às horas
      const minutos = Math.round(sessao.duracao_segundos / 60)
      if (minutos > 0 && sessao.processo_id) {
        addHora({
          processo_id: sessao.processo_id,
          advogado_id: user.id,
          data: new Date().toISOString(),
          duracao_minutos: minutos,
          atividade: sessao.descricao || 'Registo automático do timer',
          faturavel: true,
          valor_hora: 150,
        })
      }
    }
  }

  const sessoesHoje = getSessoesHoje()
  const tempoTotalHoje = getTempoTotalHoje()
  const horasHoje = Math.floor(tempoTotalHoje / 3600)
  const minutosHoje = Math.floor((tempoTotalHoje % 3600) / 60)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timer</h1>
        <p className="text-muted-foreground">Registo automático de tempo</p>
      </div>

      {sugestao && sugestao.confianca > 0.6 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Sugestão: Está a trabalhar no processo <strong>{processos.find((p) => p.id === sugestao.processo_id)?.numero}</strong>?
              <Button variant="link" className="text-blue-600 p-0 h-auto ml-2" onClick={() => setProcessoId(sugestao.processo_id || '')}>
                Usar sugestão
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 text-white">
        <CardContent className="p-8 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-blue-400" />
          <div className="text-6xl font-mono font-bold mb-4">{getTempoFormatado()}</div>
          
          {!sessaoAtiva ? (
            <div className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="O que está a fazer?"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <select
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="">Selecione o processo</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>{p.numero} - {p.descricao}</option>
                ))}
              </select>
              <Button size="lg" className="w-full" onClick={handleIniciar}>
                <Play className="mr-2 h-5 w-5" />
                Iniciar
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              {sessaoAtiva.running ? (
                <Button variant="outline" size="lg" onClick={pausarTimer}>
                  <Pause className="mr-2 h-5 w-5" />
                  Pausar
                </Button>
              ) : (
                <Button variant="outline" size="lg" onClick={retomarTimer}>
                  <Play className="mr-2 h-5 w-5" />
                  Retomar
                </Button>
              )}
              <Button variant="destructive" size="lg" onClick={handleParar}>
                <Square className="mr-2 h-5 w-5" />
                Parar & Guardar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Tempo Total Hoje</p>
            <p className="text-3xl font-bold">{horasHoje}h {minutosHoje}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Sessões Hoje</p>
            <p className="text-3xl font-bold">{sessoesHoje.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Média por Sessão</p>
            <p className="text-3xl font-bold">
              {sessoesHoje.length > 0 ? Math.round(tempoTotalHoje / sessoesHoje.length / 60) : 0}m
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessoesHoje.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhuma sessão registada hoje</p>
            ) : (
              sessoesHoje.map((sessao) => (
                <div key={sessao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{sessao.descricao || 'Sem descrição'}</p>
                    <p className="text-sm text-muted-foreground">
                      {processos.find((p) => p.id === sessao.processo_id)?.numero || 'Sem processo'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">
                      {Math.floor(sessao.duracao_segundos / 3600).toString().padStart(2, '0')}:
                      {Math.floor((sessao.duracao_segundos % 3600) / 60).toString().padStart(2, '0')}:
                      {(sessao.duracao_segundos % 60).toString().padStart(2, '0')}
                    </p>
                    <Badge variant={sessao.faturado ? 'default' : 'outline'}>
                      {sessao.faturado ? 'Faturado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
