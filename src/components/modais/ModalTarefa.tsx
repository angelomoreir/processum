import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTarefasStore } from '../../stores/tarefasStore'
import { useProcessosStore } from '../../stores/processosStore'
import { useAuthStore } from '../../stores/authStore'
import type { Tarefa, StatusTarefa, PrioridadeTarefa } from '../../types'

interface ModalTarefaProps {
  isOpen: boolean
  onClose: () => void
  tarefa?: Tarefa | null
}

const STATUS_OPTIONS: StatusTarefa[] = ['pendente', 'em_progresso', 'concluida', 'arquivada']
const PRIORIDADE_OPTIONS: PrioridadeTarefa[] = ['baixa', 'media', 'alta', 'urgente']

const STATUS_LABELS: Record<StatusTarefa, string> = {
  pendente: 'Pendente',
  em_progresso: 'Em Progresso',
  concluida: 'Concluída',
  arquivada: 'Arquivada',
}

const PRIORIDADE_LABELS: Record<PrioridadeTarefa, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export function ModalTarefa({ isOpen, onClose, tarefa }: ModalTarefaProps) {
  const { addTarefa, updateTarefa } = useTarefasStore()
  const { processos } = useProcessosStore()
  const { user } = useAuthStore()

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [status, setStatus] = useState<StatusTarefa>('pendente')
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('media')
  const [dataLimite, setDataLimite] = useState('')
  const [etiquetas, setEtiquetas] = useState('')

  useEffect(() => {
    if (tarefa) {
      setTitulo(tarefa.titulo)
      setDescricao(tarefa.descricao || '')
      setProcessoId(tarefa.processo_id || '')
      setStatus(tarefa.status)
      setPrioridade(tarefa.prioridade)
      setDataLimite(tarefa.data_limite || '')
      setEtiquetas(tarefa.etiquetas?.join(', ') || '')
    } else {
      setTitulo('')
      setDescricao('')
      setProcessoId('')
      setStatus('pendente')
      setPrioridade('media')
      setDataLimite('')
      setEtiquetas('')
    }
  }, [tarefa, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const dados = {
      titulo,
      descricao,
      processo_id: processoId || undefined,
      responsavel_id: user?.id || '1',
      status,
      prioridade,
      data_limite: dataLimite || undefined,
      etiquetas: etiquetas.split(',').map((t) => t.trim()).filter(Boolean),
    }

    if (tarefa) {
      updateTarefa(tarefa.id, dados)
    } else {
      addTarefa(dados)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {tarefa ? 'Atualize os dados da tarefa.' : 'Crie uma nova tarefa para organizar o trabalho.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Elaborar petição inicial"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes da tarefa..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Processo (opcional)</label>
            <select
              value={processoId}
              onChange={(e) => setProcessoId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">Selecione um processo</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numero} - {p.descricao}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusTarefa)}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {PRIORIDADE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PRIORIDADE_LABELS[p]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Limite</label>
            <Input
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Etiquetas (separadas por vírgula)</label>
            <Input
              value={etiquetas}
              onChange={(e) => setEtiquetas(e.target.value)}
              placeholder="urgente, civil, reunião"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{tarefa ? 'Guardar' : 'Criar Tarefa'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
