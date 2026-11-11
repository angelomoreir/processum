import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ModalPrazo } from '../components/modais/ModalPrazo'
import { usePrazosStore } from '../stores/prazosStore'
import { formatarData, calcularCorPrioridade } from '../lib/utils'
import type { Prazo } from '../types'

const TIPO_LABELS: Record<string, string> = {
  audiencia: 'Audiência',
  peticao: 'Petição',
  protocolo: 'Protocolo',
  recurso: 'Recurso',
  outro: 'Outro',
}

export function CalendarioPage() {
  const { prazos } = usePrazosStore()
  const [dataAtual, setDataAtual] = useState(new Date())
  const [vista, setVista] = useState<'semana' | 'mes'>('mes')
  const [modalAberto, setModalAberto] = useState(false)

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const mesAtual = dataAtual.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })

  const getPrazosDoDia = (data: Date) => {
    return prazos.filter((prazo) => {
      const dataPrazo = new Date(prazo.data_fim)
      return (
        dataPrazo.getDate() === data.getDate() &&
        dataPrazo.getMonth() === data.getMonth() &&
        dataPrazo.getFullYear() === data.getFullYear()
      )
    })
  }

  const navegarMes = (direcao: number) => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + direcao, 1))
  }

  const gerarDiasCalendario = () => {
    const ano = dataAtual.getFullYear()
    const mes = dataAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    const diaSemanaInicio = primeiroDia.getDay()

    const dias: (Date | null)[] = []

    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }

    for (let i = 1; i <= diasNoMes; i++) {
      dias.push(new Date(ano, mes, i))
    }

    return dias
  }

  const diasCalendario = gerarDiasCalendario()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário de Prazos</h1>
          <p className="text-muted-foreground">
            Gestão de prazos processuais
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navegarMes(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[150px] text-center font-medium capitalize">
              {mesAtual}
            </span>
            <Button variant="outline" size="icon" onClick={() => navegarMes(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={vista === 'semana' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVista('semana')}
            >
              Semana
            </Button>
            <Button
              variant={vista === 'mes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVista('mes')}
            >
              Mês
            </Button>
          </div>
          <Button onClick={() => setModalAberto(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Prazo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px border-b bg-border">
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="bg-background p-3 text-center text-sm font-medium"
                >
                  {dia}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-border">
              {diasCalendario.map((dia, index) => {
                if (!dia) {
                  return <div key={`empty-${index}`} className="min-h-[100px] bg-background" />
                }

                const prazosDoDia = getPrazosDoDia(dia)
                const isHoje =
                  dia.getDate() === new Date().getDate() &&
                  dia.getMonth() === new Date().getMonth() &&
                  dia.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={dia.toISOString()}
                    className={`min-h-[100px] bg-background p-2 ${
                      isHoje ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isHoje ? 'text-blue-600' : ''
                      }`}
                    >
                      {dia.getDate()}
                    </div>
                    <div className="space-y-1">
                      {prazosDoDia.map((prazo) => (
                        <div
                          key={prazo.id}
                          className={`rounded px-2 py-1 text-xs text-white ${
                            prazo.prioridade === 'urgente'
                              ? 'bg-red-500'
                              : prazo.prioridade === 'alta'
                              ? 'bg-orange-500'
                              : prazo.prioridade === 'media'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-blue-500'
                          }`}
                        >
                          {prazo.titulo}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prazos
                .filter((p: Prazo) => !p.concluido)
                .sort((a, b) => new Date(a.data_fim).getTime() - new Date(b.data_fim).getTime())
                .map((prazo: Prazo) => (
                  <div
                    key={prazo.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge className={calcularCorPrioridade(prazo.prioridade)}>
                        {prazo.prioridade}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {TIPO_LABELS[prazo.tipo]}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{prazo.titulo}</p>
                    <p className="text-xs text-muted-foreground">{prazo.descricao}</p>
                    <p className="text-xs font-medium">
                      {formatarData(prazo.data_fim)}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-500" />
              <span className="text-sm">Urgente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-orange-500" />
              <span className="text-sm">Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-500" />
              <span className="text-sm">Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-500" />
              <span className="text-sm">Baixa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModalPrazo
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  )
}
