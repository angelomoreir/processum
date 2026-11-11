import { useEffect } from 'react'
import { Trophy, Target, Medal, TrendingUp, Award, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useGamificacaoStore } from '../stores/gamificacaoStore'
import { useHorasStore } from '../stores/horasStore'
import { useFinanceiroStore } from '../stores/financeiroStore'
import { useProcessosStore } from '../stores/processosStore'
import { useClientesStore } from '../stores/clientesStore'

export function GamificacaoPage() {
  const { 
    pontos_total, 
    nivel, 
    badges, 
    objectivos, 
    ranking,
    verificarBadges,
    getProgressoNivel,
    getProximoNivel 
  } = useGamificacaoStore()
  
  const { horas } = useHorasStore()
  const { faturas } = useFinanceiroStore()
  const { processos } = useProcessosStore()
  const { clientes } = useClientesStore()

  // Calcula totais
  const totalHoras = horas.reduce((acc, h) => acc + h.duracao_minutos / 60, 0)
  const totalFaturas = faturas.length
  const totalProcessos = processos.length
  const totalClientes = clientes.length

  useEffect(() => {
    verificarBadges(totalHoras, totalFaturas, totalClientes, totalProcessos)
  }, [totalHoras, totalFaturas, totalClientes, totalProcessos])

  const badgesConquistados = badges.filter((b) => b.conquistado)
  const progressoNivel = getProgressoNivel() * 100
  const pontosProximoNivel = getProximoNivel()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
        <p className="text-muted-foreground">Conquistas, objectivos e leaderboard</p>
      </div>

      {/* Status do Utilizador */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl">
                <Crown className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
                <p className="text-3xl font-bold">{nivel}</p>
                <p className="text-xs text-muted-foreground">{pontos_total} pontos</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso para nível {nivel + 1}</span>
                <span>{Math.round(progressoNivel)}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressoNivel}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Faltam {pontosProximoNivel - pontos_total} pontos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Badges Conquistados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{badgesConquistados.length}</div>
            <p className="text-xs text-muted-foreground">
              de {badges.length} disponíveis
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {badgesConquistados.slice(0, 5).map((b) => (
                <span key={b.id} className="text-lg" title={b.nome}>{b.icone}</span>
              ))}
              {badgesConquistados.length > 5 && (
                <span className="text-xs text-muted-foreground">+{badgesConquistados.length - 5}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectivos Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {objectivos.filter((o) => o.completado).length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {objectivos.length} activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Objectivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectivos Trimestrais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {objectivos.map((obj) => (
              <div key={obj.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{obj.nome}</p>
                    <p className="text-sm text-muted-foreground">{obj.descricao}</p>
                  </div>
                  <Badge variant={obj.completado ? 'default' : 'outline'}>
                    {obj.completado ? '✓ Concluído' : `${obj.atual}/${obj.meta} ${obj.unidade}`}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      obj.completado ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((obj.atual / obj.meta) * 100, 100)}%` }}
                  />
                </div>
                {obj.completado && (
                  <p className="text-xs text-green-600">
                    +{obj.recompensa_pontos} pontos ganhos!
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg border ${
                    badge.conquistado 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icone}</div>
                  <p className="font-medium text-sm">{badge.nome}</p>
                  <p className="text-xs text-muted-foreground">{badge.descricao}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +{badge.pontos} pts
                    </Badge>
                    {badge.conquistado && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ranking.map((user, index) => (
                <div
                  key={user.usuario_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.pontos}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
              
              {/* Posição do utilizador atual */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                  ?
                </div>
                <div className="flex-1">
                  <p className="font-medium">Você</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{pontos_total}</p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            As Suas Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{Math.round(totalHoras)}h</p>
              <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{totalProcessos}</p>
              <p className="text-sm text-muted-foreground">Processos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{totalClientes}</p>
              <p className="text-sm text-muted-foreground">Clientes</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{totalFaturas}</p>
              <p className="text-sm text-muted-foreground">Faturas Emitidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
