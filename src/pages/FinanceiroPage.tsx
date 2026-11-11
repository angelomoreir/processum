import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, FileText, Plus, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ModalFatura } from '../components/modais/ModalFatura'
import { useFinanceiroStore } from '../stores/financeiroStore'
import { formatarMoeda } from '../lib/utils'
import type { Fatura } from '../types'

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  pendente: 'Pendente',
  paga: 'Paga',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-800',
  emitida: 'bg-blue-100 text-blue-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  paga: 'bg-green-100 text-green-800',
  atrasada: 'bg-red-100 text-red-800',
  cancelada: 'bg-gray-100 text-gray-500',
}

export function FinanceiroPage() {
  const { faturas, despesas, getRelatorioMensal } = useFinanceiroStore()
  const [modalAberto, setModalAberto] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'faturas' | 'despesas' | 'relatorio'>('faturas')
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1)
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())

  const relatorio = getRelatorioMensal(mesAtual, anoAtual)
  const faturasPendentes = faturas.filter((f: Fatura) => f.status === 'pendente' || f.status === 'atrasada')
  const totalReceber = faturasPendentes.reduce((acc: number, f: Fatura) => acc + f.valor_liquido, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gestão de faturação, despesas e relatórios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAbaAtiva('relatorio')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
          <Button onClick={() => setModalAberto(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(relatorio.receitas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(relatorio.despesas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${relatorio.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatarMoeda(relatorio.lucro)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatarMoeda(totalReceber)}</div>
            <p className="text-xs text-muted-foreground">{faturasPendentes.length} faturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <Button
          variant={abaAtiva === 'faturas' ? 'default' : 'ghost'}
          onClick={() => setAbaAtiva('faturas')}
        >
          Faturas
        </Button>
        <Button
          variant={abaAtiva === 'despesas' ? 'default' : 'ghost'}
          onClick={() => setAbaAtiva('despesas')}
        >
          Despesas
        </Button>
        <Button
          variant={abaAtiva === 'relatorio' ? 'default' : 'ghost'}
          onClick={() => setAbaAtiva('relatorio')}
        >
          Relatórios
        </Button>
      </div>

      {/* Conteúdo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {abaAtiva === 'faturas' && 'Faturas Emitidas'}
              {abaAtiva === 'despesas' && 'Registo de Despesas'}
              {abaAtiva === 'relatorio' && 'Relatório Financeiro'}
            </CardTitle>
            {abaAtiva === 'relatorio' && (
              <div className="flex gap-2">
                <select
                  value={mesAtual}
                  onChange={(e) => setMesAtual(parseInt(e.target.value))}
                  className="h-9 rounded-md border border-input bg-background px-3"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i, 1).toLocaleString('pt-PT', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={anoAtual}
                  onChange={(e) => setAnoAtual(parseInt(e.target.value))}
                  className="h-9 rounded-md border border-input bg-background px-3"
                >
                  {[2023, 2024, 2025].map((ano) => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {abaAtiva === 'faturas' && (
            <div className="space-y-4">
              {faturas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma fatura emitida</p>
              ) : (
                faturas.map((fatura: Fatura) => (
                  <div
                    key={fatura.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{fatura.numero}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[fatura.status]}`}>
                          {STATUS_LABELS[fatura.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {new Date(fatura.data_vencimento).toLocaleDateString('pt-PT')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fatura.itens.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatarMoeda(fatura.valor_total)}</p>
                      <p className="text-xs text-muted-foreground">
                        Líquido: {formatarMoeda(fatura.valor_liquido)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {abaAtiva === 'despesas' && (
            <div className="space-y-4">
              {despesas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma despesa registada</p>
              ) : (
                despesas.map((despesa) => (
                  <div
                    key={despesa.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{despesa.descricao}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {despesa.categoria} • {new Date(despesa.data).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">-{formatarMoeda(despesa.valor)}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {abaAtiva === 'relatorio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Faturas Emitidas</p>
                  <p className="text-3xl font-bold">{relatorio.faturasEmitidas}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Faturas Pagas</p>
                  <p className="text-3xl font-bold text-green-600">{relatorio.faturasPagas}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{relatorio.faturasPendentes}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Taxa de Conversão</span>
                  <span className="font-medium">
                    {relatorio.faturasEmitidas > 0
                      ? Math.round((relatorio.faturasPagas / relatorio.faturasEmitidas) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${relatorio.faturasEmitidas > 0
                        ? (relatorio.faturasPagas / relatorio.faturasEmitidas) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ModalFatura isOpen={modalAberto} onClose={() => setModalAberto(false)} />
    </div>
  )
}
