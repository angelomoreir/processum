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
import { useFinanceiroStore } from '../../stores/financeiroStore'
import { useClientesStore } from '../../stores/clientesStore'
import { useProcessosStore } from '../../stores/processosStore'
import type { ItemFatura } from '../../types'

interface ModalFaturaProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalFatura({ isOpen, onClose }: ModalFaturaProps) {
  const { addFatura } = useFinanceiroStore()
  const { clientes } = useClientesStore()
  const { processos } = useProcessosStore()
  
  const [clienteId, setClienteId] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [itens, setItens] = useState<ItemFatura[]>([
    { descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }
  ])
  const [dataVencimento, setDataVencimento] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  )
  const [notas, setNotas] = useState('')

  const atualizarItem = (index: number, campo: keyof ItemFatura, valor: string | number) => {
    const novosItens = [...itens]
    if (campo === 'descricao') {
      novosItens[index][campo] = valor as string
    } else {
      novosItens[index][campo] = Number(valor)
      if (campo === 'quantidade' || campo === 'valor_unitario') {
        novosItens[index].valor_total = novosItens[index].quantidade * novosItens[index].valor_unitario
      }
    }
    setItens(novosItens)
  }

  const adicionarItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }])
  }

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index))
    }
  }

  const calcularTotais = () => {
    const total = itens.reduce((acc, item) => acc + item.valor_total, 0)
    const iva = total * 0.23 // IVA 23%
    return {
      total,
      iva,
      liquido: total,
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totais = calcularTotais()
    
    addFatura({
      cliente_id: clienteId,
      processo_id: processoId || undefined,
      valor_total: totais.total + totais.iva,
      valor_iva: totais.iva,
      valor_liquido: totais.liquido,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: dataVencimento,
      status: 'pendente',
      itens,
      notas,
    })
    onClose()
    // Reset
    setClienteId('')
    setProcessoId('')
    setItens([{ descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }])
    setNotas('')
  }

  const totais = calcularTotais()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Fatura</DialogTitle>
          <DialogDescription>Emitir nova fatura de serviços</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente *</label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Processo (opcional)</label>
              <select
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione um processo</option>
                {processos
                  .filter((p) => !clienteId || p.cliente_id === clienteId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.numero} - {p.descricao}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Itens da Fatura</label>
            {itens.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    placeholder="Descrição"
                    value={item.descricao}
                    onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qtd"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(index, 'quantidade', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Valor unitário"
                    value={item.valor_unitario}
                    onChange={(e) => atualizarItem(index, 'valor_unitario', e.target.value)}
                  />
                </div>
                <div className="col-span-2 flex gap-1">
                  <Input
                    readOnly
                    value={`€ ${item.valor_total.toFixed(2)}`}
                    className="bg-gray-100"
                  />
                  {itens.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(index)}
                      className="text-red-600 px-2"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={adicionarItem} className="w-full">
              + Adicionar Item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Vencimento *</label>
              <Input
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Input
                placeholder="Notas adicionais"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>€ {totais.liquido.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (23%):</span>
              <span>€ {totais.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>€ {(totais.total + totais.iva).toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Emitir Fatura</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
