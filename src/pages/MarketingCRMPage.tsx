import { useState } from 'react'
import { Mail, Send, Star, Users, Gift, Megaphone, Plus } from 'lucide-react'
import { formatarMoeda } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useMarketingCRMStore } from '../stores/marketingCRMStore'

export function MarketingCRMPage() {
  const { campanhas, npsResponses, referrals, criarCampanha, enviarCampanha, getNPSMedia } = useMarketingCRMStore()
  const [abaAtiva, setAbaAtiva] = useState<'campanhas' | 'nps' | 'referrals'>('campanhas')
  const [mostrarNovaCampanha, setMostrarNovaCampanha] = useState(false)
  const [novaCampanha, setNovaCampanha] = useState({
    nome: '',
    tipo: 'email' as const,
    assunto: '',
    conteudo: '',
  })

  const handleCriarCampanha = () => {
    criarCampanha({
      ...novaCampanha,
      segmento: ['todos'],
    })
    setMostrarNovaCampanha(false)
    setNovaCampanha({ nome: '', tipo: 'email', assunto: '', conteudo: '' })
  }

  const npsMedia = getNPSMedia()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing & CRM</h1>
        <p className="text-muted-foreground">Campanhas, NPS e programa de referrals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <Mail className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Campanhas Enviadas</p>
            <p className="text-3xl font-bold">{campanhas.filter((c) => c.status === 'concluida').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Star className="h-8 w-8 text-yellow-600 mb-2" />
            <p className="text-sm text-muted-foreground">NPS Médio</p>
            <p className="text-3xl font-bold">{npsMedia.toFixed(1)}/10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Gift className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-muted-foreground">Referrals Convertidos</p>
            <p className="text-3xl font-bold">{referrals.filter((r) => r.status === 'convertido').length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'campanhas', label: 'Campanhas', icon: Megaphone },
          { id: 'nps', label: 'NPS', icon: Star },
          { id: 'referrals', label: 'Referrals', icon: Users },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={abaAtiva === tab.id ? 'default' : 'outline'}
            onClick={() => setAbaAtiva(tab.id as any)}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {abaAtiva === 'campanhas' && (
        <>
          <Button onClick={() => setMostrarNovaCampanha(true)} className="mb-4">
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>

          <div className="space-y-4">
            {campanhas.map((camp) => (
              <Card key={camp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{camp.nome}</p>
                        <Badge variant={camp.status === 'concluida' ? 'default' : 'outline'}>{camp.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{camp.assunto}</p>
                      <p className="text-xs text-muted-foreground">{camp.tipo.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      {camp.status === 'concluida' ? (
                        <div className="text-sm">
                          <p>Enviados: {camp.estatisticas.enviados}</p>
                          <p>Abertos: {camp.estatisticas.abertos}</p>
                          <p>Cliques: {camp.estatisticas.cliques}</p>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => enviarCampanha(camp.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mostrarNovaCampanha && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg mx-4">
                <CardHeader>
                  <CardTitle>Nova Campanha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nome da campanha"
                    value={novaCampanha.nome}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })}
                  />
                  <Input
                    placeholder="Assunto"
                    value={novaCampanha.assunto}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, assunto: e.target.value })}
                  />
                  <textarea
                    placeholder="Conteúdo"
                    value={novaCampanha.conteudo}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, conteudo: e.target.value })}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setMostrarNovaCampanha(false)}>Cancelar</Button>
                    <Button className="flex-1" onClick={handleCriarCampanha}>Criar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {abaAtiva === 'nps' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Net Promoter Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-11 gap-1 mb-6">
              {Array.from({ length: 11 }, (_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded flex items-center justify-center font-bold ${
                    i <= 6 ? 'bg-red-100 text-red-800' : i <= 8 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {npsResponses.filter((n) => n.responded).map((nps) => (
                <div key={nps.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Nota: {nps.nota}/10</p>
                    {nps.comentario && <p className="text-sm text-muted-foreground">"{nps.comentario}"</p>}
                  </div>
                  <Badge variant={nps.nota >= 9 ? 'default' : nps.nota >= 7 ? 'secondary' : 'destructive'}>
                    {nps.nota >= 9 ? 'Promotor' : nps.nota >= 7 ? 'Neutro' : 'Detrator'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {abaAtiva === 'referrals' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Programa de Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{ref.indicado_nome}</p>
                    <p className="text-sm text-muted-foreground">{ref.indicado_email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={ref.status === 'convertido' ? 'default' : ref.status === 'contactado' ? 'secondary' : 'outline'}>
                      {ref.status}
                    </Badge>
                    {ref.recompensa && (
                      <p className="text-sm text-green-600 mt-1">+{formatarMoeda(ref.recompensa)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
