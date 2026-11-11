import { useState } from 'react'
import { FileText, Send, Check, Package, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useOrcamentosStore } from '../stores/orcamentosStore'
import { useClientesStore } from '../stores/clientesStore'
import { useProcessosStore } from '../stores/processosStore'
import { formatarMoeda } from '../lib/utils'

const STATUS_COLORS = {
  rascunho: 'bg-gray-100 text-gray-800',
  enviado: 'bg-blue-100 text-blue-800',
  aceite: 'bg-green-100 text-green-800',
  rejeitado: 'bg-red-100 text-red-800',
  expirado: 'bg-yellow-100 text-yellow-800',
}

export function OrcamentosPage() {
  const { orcamentos, retainers, criarOrcamento, enviarOrcamento, aceitarOrcamento } = useOrcamentosStore()
  const { clientes } = useClientesStore()
  const { processos } = useProcessosStore()
  
  const [abaAtiva, setAbaAtiva] = useState<'orcamentos' | 'retainers'>('orcamentos')
  const [mostrarModal, setMostrarModal] = useState(false)
  
  const [novoOrcamento, setNovoOrcamento] = useState({
    titulo: '',
    cliente_id: '',
    processo_id: '',
    itens: [{ descricao: '', quantidade: 1, valor_unitario: 0 }],
    validade_dias: 15,
  })

  const calcularTotal = () => {
    return novoOrcamento.itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0)
  }

  const handleSubmit = () => {
    criarOrcamento({
      ...novoOrcamento,
      itens: novoOrcamento.itens.map((i) => ({
        ...i,
        valor_total: i.quantidade * i.valor_unitario,
      })),
      descricao: '',
      valor_total: calcularTotal(),
      data_emissao: new Date().toISOString(),
      data_validade: new Date(Date.now() + novoOrcamento.validade_dias * 86400000).toISOString(),
    })
    setMostrarModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos & Retainers</h1>
          <p className="text-muted-foreground">Propostas e gestão de adiantamentos</p>
        </div>
        <Button onClick={() => setMostrarModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={abaAtiva === 'orcamentos' ? 'default' : 'outline'}
          onClick={() => setAbaAtiva('orcamentos')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Orçamentos
        </Button>
        <Button
          variant={abaAtiva === 'retainers' ? 'default' : 'outline'}
          onClick={() => setAbaAtiva('retainers')}
        >
          <Package className="mr-2 h-4 w-4" />
          Retainers
        </Button>
      </div>

      {abaAtiva === 'orcamentos' && (
        <div className="space-y-4">
          {orcamentos.map((orc) => {
            const cliente = clientes.find((c) => c.id === orc.cliente_id)
            return (
              <Card key={orc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{orc.numero}</p>
                        <Badge className={STATUS_COLORS[orc.status]}>{orc.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cliente?.nome}</p>
                      <p className="text-sm">{orc.titulo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatarMoeda(orc.valor_total)}</p>
                      <p className="text-sm text-muted-foreground">Válido até: {new Date(orc.data_validade).toLocaleDateString('pt-PT')}</p>
                      {orc.status === 'rascunho' && (
                        <Button size="sm" className="mt-2" onClick={() => enviarOrcamento(orc.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar
                        </Button>
                      )}
                      {orc.status === 'enviado' && (
                        <Button size="sm" className="mt-2" onClick={() => aceitarOrcamento(orc.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Aceitar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {abaAtiva === 'retainers' && (
        <div className="space-y-4">
          {retainers.map((ret) => {
            const cliente = clientes.find((c) => c.id === ret.cliente_id)
            const percentagem = ret.horas_incluidas ? (ret.horas_consumidas / ret.horas_incluidas) * 100 : 0
            return (
              <Card key={ret.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">{cliente?.nome}</p>
                      <Badge variant={ret.status === 'ativo' ? 'default' : 'destructive'}>{ret.status}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatarMoeda(ret.valor_total)}</p>
                      <p className="text-sm text-muted-foreground">{ret.tipo}</p>
                    </div>
                  </div>
                  {ret.horas_incluidas && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Horas consumidas</span>
                        <span>{ret.horas_consumidas}h / {ret.horas_incluidas}h ({Math.round(percentagem)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${percentagem >= 100 ? 'bg-red-500' : percentagem >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(percentagem, 100)}%` }}
                        />
                      </div>
                      {ret.alerta_80 && !ret.alerta_100 && (
                        <p className="text-sm text-yellow-600 mt-1">⚠️ 80% do retainer consumido</p>
                      )}
                      {ret.alerta_100 && (
                        <p className="text-sm text-red-600 mt-1">⚠️ Retainer esgotado!</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Novo Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={novoOrcamento.titulo}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, titulo: e.target.value })}
                  placeholder="Prestação de serviços jurídicos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={novoOrcamento.cliente_id}
                    onChange={(e) => setNovoOrcamento({ ...novoOrcamento, cliente_id: e.target.value })}
                  >
                    <option value="">Selecionar...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Processo (opcional)</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={novoOrcamento.processo_id}
                    onChange={(e) => setNovoOrcamento({ ...novoOrcamento, processo_id: e.target.value })}
                  >
                    <option value="">Nenhum</option>
                    {processos.map((p) => (
                      <option key={p.id} value={p.id}>{p.numero}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Itens</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNovoOrcamento({
                        ...novoOrcamento,
                        itens: [...novoOrcamento.itens, { descricao: '', quantidade: 1, valor_unitario: 0 }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Item
                  </Button>
                </div>
                {novoOrcamento.itens.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_100px] gap-2">
                    <Input
                      placeholder="Descrição"
                      value={item.descricao}
                      onChange={(e) =>
                        setNovoOrcamento({
                          ...novoOrcamento,
                          itens: novoOrcamento.itens.map((it, i) =>
                            i === idx ? { ...it, descricao: e.target.value } : it
                          ),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) =>
                        setNovoOrcamento({
                          ...novoOrcamento,
                          itens: novoOrcamento.itens.map((it, i) =>
                            i === idx ? { ...it, quantidade: Number(e.target.value) } : it
                          ),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="€/un."
                      value={item.valor_unitario}
                      onChange={(e) =>
                        setNovoOrcamento({
                          ...novoOrcamento,
                          itens: novoOrcamento.itens.map((it, i) =>
                            i === idx ? { ...it, valor_unitario: Number(e.target.value) } : it
                          ),
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Validade (dias)</label>
                <Input
                  type="number"
                  min={1}
                  value={novoOrcamento.validade_dias}
                  onChange={(e) =>
                    setNovoOrcamento({ ...novoOrcamento, validade_dias: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <p className="font-semibold">Total: {formatarMoeda(calcularTotal())}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!novoOrcamento.titulo || !novoOrcamento.cliente_id}
                  >
                    Criar Orçamento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
