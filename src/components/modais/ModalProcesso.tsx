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
import { useProcessosStore } from '../../stores/processosStore'
import { useClientesStore } from '../../stores/clientesStore'
import { useAuthStore } from '../../stores/authStore'
import type { Processo, StatusProcesso } from '../../types'

interface ModalProcessoProps {
  isOpen: boolean
  onClose: () => void
  processo?: Processo | null
}

const STATUS: StatusProcesso[] = ['ativo', 'suspenso', 'concluido', 'arquivado']

const STATUS_LABELS: Record<StatusProcesso, string> = {
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

export function ModalProcesso({ isOpen, onClose, processo }: ModalProcessoProps) {
  const { addProcesso, updateProcesso } = useProcessosStore()
  const { clientes } = useClientesStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    cliente_id: '',
    status: 'ativo' as StatusProcesso,
    area_direito: '',
    tribunal: '',
    valor_causa: '',
    data_abertura: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (processo) {
      setFormData({
        numero: processo.numero,
        descricao: processo.descricao,
        cliente_id: processo.cliente_id,
        status: processo.status,
        area_direito: processo.area_direito,
        tribunal: processo.tribunal || '',
        valor_causa: processo.valor_causa?.toString() || '',
        data_abertura: processo.data_abertura,
      })
    } else {
      setFormData({
        numero: '',
        descricao: '',
        cliente_id: '',
        status: 'ativo',
        area_direito: '',
        tribunal: '',
        valor_causa: '',
        data_abertura: new Date().toISOString().split('T')[0],
      })
    }
  }, [processo, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const processoData = {
      ...formData,
      valor_causa: formData.valor_causa ? parseFloat(formData.valor_causa) : undefined,
      advogado_responsavel_id: user?.id || '1',
    }
    if (processo) {
      updateProcesso(processo.id, processoData)
    } else {
      addProcesso(processoData)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{processo ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
          <DialogDescription>
            {processo ? 'Atualize os dados do processo.' : 'Preencha os dados do novo processo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Número do Processo *</label>
            <Input
              required
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              placeholder="12345/2024"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição *</label>
            <Input
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ação de Indemnização"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente *</label>
            <select
              required
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusProcesso })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Área do Direito *</label>
              <Input
                required
                value={formData.area_direito}
                onChange={(e) => setFormData({ ...formData, area_direito: e.target.value })}
                placeholder="Civil, Trabalho, etc."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tribunal</label>
            <Input
              value={formData.tribunal}
              onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
              placeholder="Tribunal Judicial de Lisboa"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor da Causa (€)</label>
              <Input
                type="number"
                value={formData.valor_causa}
                onChange={(e) => setFormData({ ...formData, valor_causa: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Abertura *</label>
              <Input
                type="date"
                required
                value={formData.data_abertura}
                onChange={(e) => setFormData({ ...formData, data_abertura: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {processo ? 'Guardar Alterações' : 'Criar Processo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
