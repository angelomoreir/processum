import { useState } from 'react'
import { History, Download, Calendar, User, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuditoriaStore } from '../stores/auditoriaStore'
import type { LogAuditoria } from '../types'

const ACAO_COLORS: Record<string, string> = {
  criar: 'bg-green-100 text-green-800',
  atualizar: 'bg-blue-100 text-blue-800',
  eliminar: 'bg-red-100 text-red-800',
  visualizar: 'bg-gray-100 text-gray-800',
  exportar: 'bg-purple-100 text-purple-800',
}

export function AuditoriaPage() {
  const { logs, getEstatisticas, exportarLogs } = useAuditoriaStore()
  const [filtro, setFiltro] = useState('')
  const [filtroAcao, setFiltroAcao] = useState<string>('todas')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const estatisticas = getEstatisticas()

  const logsFiltrados = logs.filter((log: LogAuditoria) => {
    const matchFiltro = 
      log.entidade.toLowerCase().includes(filtro.toLowerCase()) ||
      log.usuario_id.toLowerCase().includes(filtro.toLowerCase())
    const matchAcao = filtroAcao === 'todas' || log.acao === filtroAcao
    
    let matchData = true
    if (dataInicio && dataFim) {
      const logData = new Date(log.created_at)
      matchData = logData >= new Date(dataInicio) && logData <= new Date(dataFim)
    }
    
    return matchFiltro && matchAcao && matchData
  })

  const handleExportar = (formato: 'csv' | 'json') => {
    const conteudo = exportarLogs(formato)
    const blob = new Blob([conteudo], { 
      type: formato === 'csv' ? 'text/csv' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.${formato}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
          <p className="text-muted-foreground">Rastreamento completo de todas as ações no sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportar('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportar('json')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Criações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas.por_acao.criar || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas.por_acao.atualizar || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eliminações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas.por_acao.eliminar || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar entidade ou usuário..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="todas">Todas as ações</option>
              <option value="criar">Criar</option>
              <option value="atualizar">Atualizar</option>
              <option value="eliminar">Eliminar</option>
              <option value="visualizar">Visualizar</option>
              <option value="exportar">Exportar</option>
            </select>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-auto"
              />
              <span>até</span>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações ({logsFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logsFiltrados.slice(0, 50).map((log: LogAuditoria) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={ACAO_COLORS[log.acao] || 'bg-gray-100'}>
                        {log.acao}
                      </Badge>
                      <span className="font-medium capitalize">{log.entidade}</span>
                      <span className="text-muted-foreground">({log.entidade_id.slice(0, 8)})</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {JSON.stringify(log.detalhes).slice(0, 100)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {log.usuario_id.slice(0, 8)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('pt-PT')}
                  </p>
                  <p className="text-xs text-muted-foreground">{log.ip_address}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
