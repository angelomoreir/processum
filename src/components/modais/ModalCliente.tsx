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
import { useClientesStore } from '../../stores/clientesStore'
import type { Cliente, EstagioLead } from '../../types'

interface ModalClienteProps {
  isOpen: boolean
  onClose: () => void
  cliente?: Cliente | null
}

const ESTAGIOS: EstagioLead[] = ['lead', 'contatado', 'reuniao', 'contratado', 'ativo']

const ESTAGIO_LABELS: Record<EstagioLead, string> = {
  lead: 'Lead',
  contatado: 'Contatado',
  reuniao: 'Reunião Agendada',
  contratado: 'Contratado',
  ativo: 'Cliente Ativo',
}

export function ModalCliente({ isOpen, onClose, cliente }: ModalClienteProps) {
  const { addCliente, updateCliente } = useClientesStore()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    nif: '',
    morada: '',
    estagio: 'lead' as EstagioLead,
    area_direito: '',
    notas: '',
  })

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        nif: cliente.nif,
        morada: cliente.morada || '',
        estagio: cliente.estagio,
        area_direito: cliente.area_direito || '',
        notas: cliente.notas || '',
      })
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        nif: '',
        morada: '',
        estagio: 'lead',
        area_direito: '',
        notas: '',
      })
    }
  }, [cliente, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cliente) {
      updateCliente(cliente.id, formData)
    } else {
      addCliente(formData)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {cliente ? 'Atualize os dados do cliente.' : 'Preencha os dados do novo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome *</label>
            <Input
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome completo ou empresa"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.pt"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone *</label>
              <Input
                required
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="+351 900 000 000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">NIF *</label>
              <Input
                required
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estágio</label>
              <select
                value={formData.estagio}
                onChange={(e) => setFormData({ ...formData, estagio: e.target.value as EstagioLead })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {ESTAGIOS.map((est) => (
                  <option key={est} value={est}>
                    {ESTAGIO_LABELS[est]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Morada</label>
            <Input
              value={formData.morada}
              onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
              placeholder="Rua, número, cidade"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Área do Direito</label>
            <Input
              value={formData.area_direito}
              onChange={(e) => setFormData({ ...formData, area_direito: e.target.value })}
              placeholder="Civil, Trabalho, Família, etc."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Observações sobre o cliente"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {cliente ? 'Guardar Alterações' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
