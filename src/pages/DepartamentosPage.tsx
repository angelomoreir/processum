import { useState } from 'react'
import { Building2, Users, Target, Briefcase, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useDepartamentosStore } from '../stores/departamentosStore'
import { useProcessosStore } from '../stores/processosStore'
import { useHorasStore } from '../stores/horasStore'
import { useFinanceiroStore } from '../stores/financeiroStore'
import { useAuthStore } from '../stores/authStore'
import { formatarMoeda } from '../lib/utils'

export function DepartamentosPage() {
  const { departamentos, getMembrosByDepartamento } = useDepartamentosStore()
  const { processos } = useProcessosStore()
  const { horas } = useHorasStore()
  const { faturas } = useFinanceiroStore()
  const { user } = useAuthStore()
  
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState<string | null>(null)

  const getEstatisticasDepartamento = (departamentoId: string) => {
    const processosDept = processos.filter((p) => {
      const dept = departamentos.find((d) => d.id === departamentoId)
      return dept && p.area_direito === dept.area_direito
    })
    
    const membrosDept = getMembrosByDepartamento(departamentoId)
    const totalHoras = membrosDept.reduce((acc, membro) => {
      const horasMembro = horas
        .filter((h) => h.advogado_id === membro.usuario_id)
        .reduce((sum, h) => sum + h.duracao_minutos / 60, 0)
      return acc + horasMembro
    }, 0)
    
    const totalFaturado = faturas
      .filter((f) => processosDept.some((p) => p.id === f.processo_id))
      .reduce((acc, f) => acc + f.valor_liquido, 0)
    
    return {
      processos: processosDept.length,
      horas: Math.round(totalHoras),
      faturado: totalFaturado,
      membros: membrosDept.length,
    }
  }

  const dept = departamentoSelecionado 
    ? departamentos.find((d) => d.id === departamentoSelecionado)
    : null

  const estatisticas = dept ? getEstatisticasDepartamento(dept.id) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departamentos</h1>
          <p className="text-muted-foreground">Gestão por áreas de direito</p>
        </div>
        {user?.perfil === 'socio' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Departamento
          </Button>
        )}
      </div>

      {!departamentoSelecionado ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departamentos
            .filter((d) => d.ativo)
            .map((dept) => {
              const stats = getEstatisticasDepartamento(dept.id)
              return (
                <Card 
                  key={dept.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setDepartamentoSelecionado(dept.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.cor }}
                      />
                      <Badge variant="outline">{dept.area_direito}</Badge>
                    </div>
                    <CardTitle className="text-lg">{dept.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {dept.descricao}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-bold">{stats.processos}</p>
                        <p className="text-xs text-muted-foreground">Processos</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-bold">{stats.horas}h</p>
                        <p className="text-xs text-muted-foreground">Horas</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-bold text-xs">{formatarMoeda(stats.faturado)}</p>
                        <p className="text-xs text-muted-foreground">Faturado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setDepartamentoSelecionado(null)}>
              ← Voltar
            </Button>
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: dept?.cor }}
            />
            <h2 className="text-2xl font-bold">{dept?.nome}</h2>
            <Badge>{dept?.area_direito}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Processos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.processos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Membros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.membros}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Horas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.horas}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Faturado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatarMoeda(estatisticas?.faturado || 0)}</div>
              </CardContent>
            </Card>
          </div>

          {dept && (
            <Card>
              <CardHeader>
                <CardTitle>Metas do Departamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Faturação Mensal</span>
                    <span className="font-medium">{formatarMoeda(dept.metas.faturacao_mensal)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((estatisticas?.faturado || 0) / dept.metas.faturacao_mensal * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Horas Mínimas</span>
                    <span className="font-medium">{dept.metas.horas_minimas}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((estatisticas?.horas || 0) / dept.metas.horas_minimas * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
