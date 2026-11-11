import { useState } from 'react'
import { Shield, FileCheck, UserX, Download, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useLGPDStore } from '../stores/lgpdStore'
import { useClientesStore } from '../stores/clientesStore'

export function LGPDPage() {
  const { consentimentos, politicas, pedidos, getPedidosPendentes, getPedidosForaPrazo, exportarDados, anonimizarDados } = useLGPDStore()
  const { clientes } = useClientesStore()
  const [abaAtiva, setAbaAtiva] = useState<'consentimentos' | 'politicas' | 'pedidos'>('consentimentos')
  const [clienteSelecionado, setClienteSelecionado] = useState('')

  const pedidosPendentes = getPedidosPendentes()
  const pedidosForaPrazo = getPedidosForaPrazo()

  const handleExportar = () => {
    if (clienteSelecionado) {
      const dados = exportarDados(clienteSelecionado)
      alert('Dados exportados (simulação): ' + dados.substring(0, 100) + '...')
    }
  }

  const handleAnonimizar = () => {
    if (clienteSelecionado && confirm('Tem certeza que deseja anonimizar todos os dados deste cliente? Esta ação é irreversível.')) {
      anonimizarDados(clienteSelecionado)
      alert('Dados anonimizados com sucesso!')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cumprimento Normativo (LGPD/GDPR)</h1>
        <p className="text-muted-foreground">Gestão de privacidade e proteção de dados</p>
      </div>

      {pedidosForaPrazo.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">{pedidosForaPrazo.length} pedido(s) fora do prazo legal!</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <FileCheck className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-muted-foreground">Consentimentos Válidos</p>
            <p className="text-3xl font-bold">{consentimentos.filter((c) => c.status === 'aceite').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Políticas Ativas</p>
            <p className="text-3xl font-bold">{politicas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <UserX className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
            <p className="text-3xl font-bold">{pedidosPendentes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-sm text-muted-foreground">Fora do Prazo</p>
            <p className="text-3xl font-bold">{pedidosForaPrazo.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'consentimentos', label: 'Consentimentos' },
          { id: 'politicas', label: 'Políticas' },
          { id: 'pedidos', label: 'Pedidos' },
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

      {abaAtiva === 'consentimentos' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exportar/Anonimizar Dados</CardTitle>
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
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleExportar}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleAnonimizar}>
                  <UserX className="mr-2 h-4 w-4" />
                  Anonimizar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {consentimentos.map((cons) => {
              const cliente = clientes.find((c) => c.id === cons.cliente_id)
              return (
                <Card key={cons.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{cliente?.nome}</p>
                        <p className="text-sm text-muted-foreground">Tipo: {cons.tipo}</p>
                        <p className="text-xs text-muted-foreground">Versão: {cons.versao}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={cons.status === 'aceite' ? 'default' : cons.status === 'recusado' ? 'destructive' : 'outline'}>
                          {cons.status}
                        </Badge>
                        {cons.data_resposta && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(cons.data_resposta).toLocaleDateString('pt-PT')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {abaAtiva === 'politicas' && (
        <div className="space-y-4">
          {politicas.map((pol) => (
            <Card key={pol.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{pol.nome}</p>
                      {pol.obrigatoria && <Badge variant="destructive">Obrigatória</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">Versão {pol.versao}</p>
                    <p className="text-xs text-muted-foreground">
                      Publicada em: {new Date(pol.data_publicacao).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>
                <p className="text-sm mt-3 text-gray-600">{pol.conteudo.substring(0, 150)}...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {abaAtiva === 'pedidos' && (
        <div className="space-y-4">
          {pedidos.map((ped) => {
            const cliente = clientes.find((c) => c.id === ped.cliente_id)
            return (
              <Card key={ped.id} className={pedidosForaPrazo.includes(ped) ? 'border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{cliente?.nome}</p>
                        <Badge variant={ped.status === 'concluido' ? 'default' : ped.status === 'pendente' ? 'outline' : 'secondary'}>
                          {ped.status}
                        </Badge>
                        {pedidosForaPrazo.includes(ped) && <Badge variant="destructive">Fora do prazo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">Tipo: {ped.tipo}</p>
                      <p className="text-sm">{ped.descricao}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Prazo: {ped.prazo_dias} dias
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pedido em: {new Date(ped.data_pedido).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
