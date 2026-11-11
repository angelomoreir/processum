import { useEffect } from 'react'
import { AlertTriangle, Users, GitGraph, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useConflitosStore } from '../stores/conflitosStore'
import { useProcessosStore } from '../stores/processosStore'

export function ConflitosPage() {
  const { partes, relacoes, conflitos, detectarConflitos } = useConflitosStore()
  const { processos } = useProcessosStore()

  useEffect(() => {
    detectarConflitos()
  }, [])

  const conflitosAltos = conflitos.filter((c) => c.severidade === 'alta')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verificação de Conflitos</h1>
        <p className="text-muted-foreground">Deteção de conflitos de interesses e relações entre partes</p>
      </div>

      {conflitosAltos.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">{conflitosAltos.length} conflito(s) de alto risco detetado(s)</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Partes Registadas</p>
            <p className="text-3xl font-bold">{partes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <GitGraph className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-muted-foreground">Relações Mapeadas</p>
            <p className="text-3xl font-bold">{relacoes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Shield className="h-8 w-8 text-red-600 mb-2" />
            <p className="text-sm text-muted-foreground">Conflitos Ativos</p>
            <p className="text-3xl font-bold">{conflitos.filter((c) => c.status === 'pendente').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conflitos Detetados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conflitos.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum conflito detetado</p>
            ) : (
              conflitos.map((conflito) => {
                const partesEnvolvidas = conflito.partes_envolvidas
                  .map((id) => partes.find((p) => p.id === id))
                  .filter(Boolean)
                
                return (
                  <div
                    key={conflito.id}
                    className={`p-4 rounded-lg border ${
                      conflito.severidade === 'alta'
                        ? 'bg-red-50 border-red-200'
                        : conflito.severidade === 'media'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              conflito.severidade === 'alta'
                                ? 'text-red-600'
                                : conflito.severidade === 'media'
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                            }`}
                          />
                          <p className="font-medium">{conflito.descricao}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Partes: {partesEnvolvidas.map((p) => p?.nome).join(' vs ')}
                        </p>
                        {conflito.processo_id && (
                          <p className="text-xs text-muted-foreground">
                            Processo: {processos.find((pr) => pr.id === conflito.processo_id)?.numero}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            conflito.severidade === 'alta'
                              ? 'destructive'
                              : conflito.severidade === 'media'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {conflito.severidade}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{conflito.status}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Base de Partes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {partes.map((parte) => (
              <div key={parte.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{parte.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {parte.tipo === 'pessoa' ? 'Pessoa' : 'Empresa'}
                    {parte.nif && ` • NIF: ${parte.nif}`}
                  </p>
                </div>
                {parte.alerta_conflito && <Badge variant="destructive">Alerta</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
