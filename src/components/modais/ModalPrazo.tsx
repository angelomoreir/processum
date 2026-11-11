import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { usePrazosStore, REGRAS_PRAZO, calcularDataFinal } from '../../stores/prazosStore'
import { useProcessosStore } from '../../stores/processosStore'
import { useAuthStore } from '../../stores/authStore'
import type { TipoPrazo, PrioridadePrazo } from '../../types'

interface ModalPrazoProps {
  isOpen: boolean
  onClose: () => void
  processoId?: string
}

const TIPOS: TipoPrazo[] = ['audiencia', 'peticao', 'protocolo', 'recurso', 'outro']
const PRIORIDADES: PrioridadePrazo[] = ['baixa', 'media', 'alta', 'urgente']

const TIPO_LABELS: Record<TipoPrazo, string> = {
  audiencia: 'Audiência',
  peticao: 'Petição',
  protocolo: 'Protocolo',
  recurso: 'Recurso',
  outro: 'Outro',
}

const PRIORIDADE_LABELS: Record<PrioridadePrazo, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export function ModalPrazo({ isOpen, onClose, processoId: initialProcessoId }: ModalPrazoProps) {
  const { addPrazo } = usePrazosStore()
  const { processos } = useProcessosStore()
  const { user } = useAuthStore()
  const [usarCalculoAutomatico, setUsarCalculoAutomatico] = useState(true)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    processo_id: initialProcessoId || '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    tipo: 'peticao' as TipoPrazo,
    prioridade: 'media' as PrioridadePrazo,
  })

  // Cálculo automático da data final baseado no tipo
  useEffect(() => {
    if (usarCalculoAutomatico) {
      const regra = REGRAS_PRAZO[formData.tipo]
      const dataInicio = new Date(formData.data_inicio)
      const dataFim = calcularDataFinal(dataInicio, formData.tipo, regra.dias, regra.diasUteis)
      setFormData((prev) => ({ ...prev, data_fim: dataFim.toISOString().split('T')[0] }))
    }
  }, [formData.tipo, formData.data_inicio, usarCalculoAutomatico])

  useEffect(() => {
    if (initialProcessoId) {
      setFormData((prev) => ({ ...prev, processo_id: initialProcessoId }))
    }
  }, [initialProcessoId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPrazo({
      ...formData,
      concluido: false,
      created_by: user?.id || '1',
    })
    onClose()
    // Reset form
    setFormData({
      titulo: '',
      descricao: '',
      processo_id: initialProcessoId || '',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      tipo: 'peticao',
      prioridade: 'media',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Prazo</DialogTitle>
          <DialogDescription>
            Crie um novo prazo processual. A data final é calculada automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Audiência de Julgamento"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhes do prazo"
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Processo *</label>
            <select
              required
              value={formData.processo_id}
              onChange={(e) => setFormData({ ...formData, processo_id: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
              disabled={!!initialProcessoId}
            >
              <option value="">Selecione um processo</option>
              {processos.map((processo) => (
                <option key={processo.id} value={processo.id}>
                  {processo.numero} - {processo.descricao}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo *</label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoPrazo })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {TIPO_LABELS[tipo]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select
                value={formData.prioridade}
                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as PrioridadePrazo })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORIDADE_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Data de Início *</label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={usarCalculoAutomatico}
                  onChange={(e) => setUsarCalculoAutomatico(e.target.checked)}
                  className="rounded"
                />
                Cálculo automático
              </label>
            </div>
            <Input
              type="date"
              required
              value={formData.data_inicio}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Regra: {REGRAS_PRAZO[formData.tipo].dias} dias {REGRAS_PRAZO[formData.tipo].diasUteis ? 'úteis' : 'corridos'}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final *</label>
            <Input
              type="date"
              required
              value={formData.data_fim}
              onChange={(e) => {
                setUsarCalculoAutomatico(false)
                setFormData({ ...formData, data_fim: e.target.value })
              }}
              disabled={usarCalculoAutomatico}
            />
            {usarCalculoAutomatico && (
              <p className="text-xs text-green-600">Calculado automaticamente</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Criar Prazo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
