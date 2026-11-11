import { useState } from 'react'
import { Plus, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ModalTarefa } from '../components/modais/ModalTarefa'
import { useTarefasStore } from '../stores/tarefasStore'
import { useProcessosStore } from '../stores/processosStore'
import type { Tarefa, StatusTarefa } from '../types'

const COLUNAS: { id: StatusTarefa; titulo: string; cor: string }[] = [
  { id: 'pendente', titulo: 'Pendente', cor: 'bg-gray-100' },
  { id: 'em_progresso', titulo: 'Em Progresso', cor: 'bg-blue-50' },
  { id: 'concluida', titulo: 'Concluída', cor: 'bg-green-50' },
  { id: 'arquivada', titulo: 'Arquivada', cor: 'bg-gray-50' },
]

const PRIORIDADE_COLORS: Record<string, string> = {
  baixa: 'bg-blue-100 text-blue-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
}

export function KanbanPage() {
  const { tarefas, moverTarefa } = useTarefasStore()
  const { processos } = useProcessosStore()
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null)
  const [dragando, setDragando] = useState<string | null>(null)

  const handleDragStart = (tarefaId: string) => {
    setDragando(tarefaId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, novoStatus: StatusTarefa) => {
    e.preventDefault()
    if (dragando) {
      moverTarefa(dragando, novoStatus)
      setDragando(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Kanban</h1>
          <p className="text-muted-foreground">Gestão visual de tarefas e atividades</p>
        </div>
        <Button onClick={() => { setTarefaEditando(null); setModalAberto(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUNAS.map((coluna) => {
          const tarefasColuna = tarefas.filter((t: Tarefa) => t.status === coluna.id)
          
          return (
            <div
              key={coluna.id}
              className={`${coluna.cor} rounded-lg p-3 min-h-[500px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, coluna.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{coluna.titulo}</h3>
                <Badge variant="outline">{tarefasColuna.length}</Badge>
              </div>

              <div className="space-y-3">
                {tarefasColuna.map((tarefa: Tarefa) => {
                  const processo = processos.find((p) => p.id === tarefa.processo_id)
                  const isAtrasada = tarefa.data_limite && new Date(tarefa.data_limite) < new Date() && tarefa.status !== 'concluida'

                  return (
                    <Card
                      key={tarefa.id}
                      draggable
                      onDragStart={() => handleDragStart(tarefa.id)}
                      className={`cursor-move hover:shadow-md transition-shadow ${isAtrasada ? 'border-red-300' : ''}`}
                      onClick={() => { setTarefaEditando(tarefa); setModalAberto(true) }}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{tarefa.titulo}</p>
                          {isAtrasada && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                        
                        {tarefa.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {tarefa.descricao}
                          </p>
                        )}

                        {processo && (
                          <p className="text-xs text-blue-600">{processo.numero}</p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <Badge className={`text-xs ${PRIORIDADE_COLORS[tarefa.prioridade]}`}>
                            {tarefa.prioridade}
                          </Badge>
                          
                          {tarefa.data_limite && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(tarefa.data_limite).toLocaleDateString('pt-PT')}
                            </div>
                          )}
                        </div>

                        {tarefa.etiquetas && tarefa.etiquetas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tarefa.etiquetas.map((tag) => (
                              <span key={tag} className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <ModalTarefa
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        tarefa={tarefaEditando}
      />
    </div>
  )
}
