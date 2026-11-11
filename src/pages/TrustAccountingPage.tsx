import { useState } from 'react'
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useTrustAccountingStore } from '../stores/trustAccountingStore'
import { useClientesStore } from '../stores/clientesStore'
import { useAuthStore } from '../stores/authStore'
import { formatarMoeda } from '../lib/utils'

export function TrustAccountingPage() {
  const { contas, movimentacoes, depositar, levantar, getContaByCliente, getSaldoTotal } = useTrustAccountingStore()
  const { clientes } = useClientesStore()
  const { user } = useAuthStore()
  
  const [abaAtiva, setAbaAtiva] = useState<'contas' | 'movimentacoes' | 'reconciliacao'>('contas')
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')

  const handleDeposito = () => {
    const conta = getContaByCliente(clienteSelecionado)
    if (conta) {
      depositar(conta.id, parseFloat(valor), descricao, user?.id || '')
      setValor('')
      setDescricao('')
    }
  }

  const handleLevantamento = () => {
    const conta = getContaByCliente(clienteSelecionado)
    if (conta) {
      const sucesso = levantar(conta.id, parseFloat(valor), descricao, user?.id || '')
      if (sucesso) {
        setValor('')
        setDescricao('')
      } else {
        alert('Saldo insuficiente!')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trust Accounting</h1>
        <p className="text-muted-foreground">Gestão de fundos em custódia</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <Wallet className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Saldo Total em Custódia</p>
            <p className="text-3xl font-bold">{formatarMoeda(getSaldoTotal())}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total de Contas</p>
            <p className="text-3xl font-bold">{contas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Movimentações Hoje</p>
            <p className="text-3xl font-bold">{movimentacoes.filter(m => m.data_movimentacao.startsWith(new Date().toISOString().split('T')[0])).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'contas', label: 'Contas' },
          { id: 'movimentacoes', label: 'Movimentações' },
          { id: 'reconciliacao', label: 'Reconciliação' },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={abaAtiva === tab.id ? 'default' : 'outline'}
            onClick={() => setAbaAtiva(tab.id as any)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {abaAtiva === 'contas' && (
        <div className="grid gap-4">
          {contas.map((conta) => {
            const cliente = clientes.find((c) => c.id === conta.cliente_id)
            return (
              <Card key={conta.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cliente?.nome}</p>
                    <p className="text-sm text-muted-foreground">Conta: {conta.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatarMoeda(conta.saldo)}</p>
                    <Badge variant={conta.status === 'ativa' ? 'default' : 'secondary'}>{conta.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {abaAtiva === 'movimentacoes' && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Movimentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">Selecione o cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleDeposito} className="flex-1">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Depositar
              </Button>
              <Button onClick={handleLevantamento} variant="outline" className="flex-1">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Levantar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
