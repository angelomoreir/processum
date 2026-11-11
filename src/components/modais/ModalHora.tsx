import { useState } from 'react'
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
import { useHorasStore } from '../../stores/horasStore'
import { useProcessosStore } from '../../stores/processosStore'
import { useAuthStore } from '../../stores/authStore'

interface ModalHoraProps {
  isOpen: boolean
  onClose: () => void
  processoId?: string
}

export function ModalHora({ isOpen, onClose, processoId: initialProcessoId }: ModalHoraProps) {
  const { addHora } = useHorasStore()
  const { processos } = useProcessosStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    processo_id: initialProcessoId || '',
    data: new Date().toISOString().split('T')[0],
    atividade: '',
    duracao_horas: '',
    duracao_minutos: '',
    faturavel: true,
    valor_hora: '150',
    notas: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const duracaoTotal = 
      (parseInt(formData.duracao_horas) || 0) * 60 + 
      (parseInt(formData.duracao_minutos) || 0)
    
    addHora({
      processo_id: formData.processo_id,
      advogado_id: user?.id || '1',
      data: formData.data,
      atividade: formData.atividade,
      duracao_minutos: duracaoTotal,
      faturavel: formData.faturavel,
      valor_hora: formData.faturavel ? parseFloat(formData.valor_hora) : undefined,
      notas: formData.notas,
    })
    onClose()
    // Reset form
    setFormData({
      processo_id: initialProcessoId || '',
      data: new Date().toISOString().split('T')[0],
      atividade: '',
      duracao_horas: '',
      duracao_minutos: '',
      faturavel: true,
      valor_hora: '150',
      notas: '',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registar Horas</DialogTitle>
          <DialogDescription>
            Registe o tempo gasto numa atividade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Atividade *</label>
            <Input
              required
              value={formData.atividade}
              onChange={(e) => setFormData({ ...formData, atividade: e.target.value })}
              placeholder="Ex: Reunião com cliente, Elaboração de petição"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data *</label>
            <Input
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Duração *</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  value={formData.duracao_horas}
                  onChange={(e) => setFormData({ ...formData, duracao_horas: e.target.value })}
                  placeholder="0"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">horas</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                  placeholder="0"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.faturavel}
                onChange={(e) => setFormData({ ...formData, faturavel: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Faturável</span>
            </label>
            {formData.faturavel && (
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.valor_hora}
                    onChange={(e) => setFormData({ ...formData, valor_hora: e.target.value })}
                    placeholder="150"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">€/hora</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Detalhes adicionais"
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Registar Horas</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
