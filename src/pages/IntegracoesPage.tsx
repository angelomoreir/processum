import { useState } from 'react'
import { 
  Building2, 
  Scale, 
  BookOpen, 
  Newspaper, 
  CreditCard, 
  Linkedin,
  Search,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useIntegracoesStore } from '../stores/integracoesStore'
import { formatarMoeda } from '../lib/utils'

export function IntegracoesPage() {
  const {
    consultarCitius,
    pesquisarJurisprudencia,
    pesquisarLegislacao,
    alertasLegais,
    ativarAlerta,
    desativarAlerta,
    consultarCRC,
    criarPagamentoMBWay,
    criarReferenciaMultibanco,
    importarContacto,
    pesquisarLinkedIn,
    pagamentosMBWay,
    contactosLinkedIn,
  } = useIntegracoesStore()

  const [abaAtiva, setAbaAtiva] = useState<'citius' | 'jurisprudencia' | 'legislacao' | 'crc' | 'pagamentos' | 'linkedin'>('citius')
  const [loading, setLoading] = useState(false)
  
  // Estados específicos
  const [numeroProcesso, setNumeroProcesso] = useState('')
  const [resultadoCitius, setResultadoCitius] = useState<any>(null)
  
  const [termoJurisprudencia, setTermoJurisprudencia] = useState('')
  const [resultadosJurisprudencia, setResultadosJurisprudencia] = useState<any[]>([])
  
  const [termoLegislacao, setTermoLegislacao] = useState('')
  const [resultadosLegislacao, setResultadosLegislacao] = useState<any[]>([])
  
  const [nifCRC, setNifCRC] = useState('')
  const [resultadoCRC, setResultadoCRC] = useState<any>(null)
  
  const [valorPagamento, setValorPagamento] = useState('')
  const [telefoneMBWay, setTelefoneMBWay] = useState('')
  const [referenciaMultibanco, setReferenciaMultibanco] = useState<any>(null)
  
  const [urlLinkedIn, setUrlLinkedIn] = useState('')
  const [termoLinkedIn, setTermoLinkedIn] = useState('')
  const [resultadosLinkedIn, setResultadosLinkedIn] = useState<any[]>([])

  const handleConsultarCitius = async () => {
    setLoading(true)
    const resultado = await consultarCitius(numeroProcesso)
    setResultadoCitius(resultado)
    setLoading(false)
  }

  const handlePesquisarJurisprudencia = async () => {
    setLoading(true)
    const resultados = await pesquisarJurisprudencia(termoJurisprudencia)
    setResultadosJurisprudencia(resultados)
    setLoading(false)
  }

  const handlePesquisarLegislacao = async () => {
    setLoading(true)
    const resultados = await pesquisarLegislacao(termoLegislacao)
    setResultadosLegislacao(resultados)
    setLoading(false)
  }

  const handleConsultarCRC = async () => {
    setLoading(true)
    const resultado = await consultarCRC(nifCRC)
    setResultadoCRC(resultado)
    setLoading(false)
  }

  const handleCriarMBWay = async () => {
    setLoading(true)
    await criarPagamentoMBWay({
      telefone: telefoneMBWay,
      valor: parseFloat(valorPagamento),
      descricao: 'Pagamento de serviços advocatícios',
    })
    setLoading(false)
  }

  const handleCriarMultibanco = async () => {
    setLoading(true)
    const ref = await criarReferenciaMultibanco(
      parseFloat(valorPagamento),
      'Pagamento de fatura'
    )
    setReferenciaMultibanco(ref)
    setLoading(false)
  }

  const handleImportarLinkedIn = async () => {
    setLoading(true)
    await importarContacto(urlLinkedIn)
    setUrlLinkedIn('')
    setLoading(false)
  }

  const handlePesquisarLinkedIn = async () => {
    setLoading(true)
    const resultados = await pesquisarLinkedIn(termoLinkedIn)
    setResultadosLinkedIn(resultados)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações Externas</h1>
        <p className="text-muted-foreground">Citius, DGSI, Diário da República, CRC, MB WAY e LinkedIn</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'citius', label: 'Citius/TJ', icon: Scale },
          { id: 'jurisprudencia', label: 'DGSI', icon: BookOpen },
          { id: 'legislacao', label: 'Diário República', icon: Newspaper },
          { id: 'crc', label: 'Conservatória', icon: Building2 },
          { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
          { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
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

      {/* CITIUS */}
      {abaAtiva === 'citius' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta Citius</CardTitle>
              <CardDescription>Consulte processos nos tribunais portugueses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Número do processo (ex: 1234/24.0T8STJ)"
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleConsultarCitius} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Consultar
                </Button>
              </div>

              {resultadoCitius && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{resultadoCitius.numero}</h3>
                    <Badge>{resultadoCitius.tribunal}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Autor</p>
                      <p className="font-medium">{resultadoCitius.partes.autor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Réu</p>
                      <p className="font-medium">{resultadoCitius.partes.reu}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Movimentações</p>
                    <div className="space-y-1">
                      {resultadoCitius.movimentacoes.map((m: any, i: number) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground">{m.data}</span>
                          <span>{m.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Prazos</p>
                    <div className="flex gap-2 flex-wrap">
                      {resultadoCitius.prazos.map((p: any, i: number) => (
                        <Badge key={i} variant={p.status === 'cumprido' ? 'default' : 'outline'}>
                          {p.tipo}: {p.data_vencimento}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protocolo Eletrónico</CardTitle>
              <CardDescription>Protocolar documentos diretamente no Citius (simulação)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                <AlertCircle className="inline h-4 w-4 mr-2" />
                Esta funcionalidade requer certificado digital qualificado e acesso ao Citius.
                Em modo de demonstração, mostra apenas o fluxo simulado.
              </div>
              <Button className="mt-4" variant="outline" disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Citius (requer autenticação)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DGSI */}
      {abaAtiva === 'jurisprudencia' && (
        <Card>
          <CardHeader>
            <CardTitle>Pesquisa de Jurisprudência (DGSI)</CardTitle>
            <CardDescription>Consulte acórdãos e decisões judiciais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Termo de pesquisa (ex: responsabilidade civil)"
                value={termoJurisprudencia}
                onChange={(e) => setTermoJurisprudencia(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handlePesquisarJurisprudencia} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Pesquisar
              </Button>
            </div>

            <div className="space-y-3">
              {resultadosJurisprudencia.map((acordao) => (
                <Card key={acordao.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{acordao.numero}</h3>
                          <Badge variant="outline">{acordao.tribunal}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{acordao.sumario}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>Relator: {acordao.relator}</span>
                          <span>•</span>
                          <span>{acordao.data}</span>
                          <span>•</span>
                          <span className="font-medium text-blue-600">{acordao.decisao}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diário da República */}
      {abaAtiva === 'legislacao' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pesquisa Legislativa</CardTitle>
              <CardDescription>Consulte o Diário da República</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Termo de pesquisa"
                  value={termoLegislacao}
                  onChange={(e) => setTermoLegislacao(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handlePesquisarLegislacao} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Pesquisar
                </Button>
              </div>

              <div className="space-y-2">
                {resultadosLegislacao.map((leg) => (
                  <Card key={leg.id} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{leg.numero}</h3>
                          <p className="text-sm text-muted-foreground">{leg.sumario}</p>
                          <div className="flex gap-1 mt-1">
                            {leg.area_direito.map((a: string) => (
                              <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas Legislativos</CardTitle>
              <CardDescription>Receba notificações de alterações legislativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Civil', 'Trabalho', 'Penal', 'Fiscal', 'Comercial'].map((area) => (
                  <Button
                    key={area}
                    variant={alertasLegais.includes(area) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => 
                      alertasLegais.includes(area) ? desativarAlerta(area) : ativarAlerta(area)
                    }
                  >
                    {alertasLegais.includes(area) && <CheckCircle className="mr-1 h-3 w-3" />}
                    {area}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Será notificado por email quando houver legislação nova nas áreas selecionadas.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CRC */}
      {abaAtiva === 'crc' && (
        <Card>
          <CardHeader>
            <CardTitle>Consulta Conservatória do Registo Comercial</CardTitle>
            <CardDescription>Consulte informações de empresas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="NIF da empresa"
                value={nifCRC}
                onChange={(e) => setNifCRC(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleConsultarCRC} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Consultar
              </Button>
            </div>

            {resultadoCRC && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold">{resultadoCRC.denominacao}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">NIF</p>
                    <p className="font-medium">{resultadoCRC.nif}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Forma Jurídica</p>
                    <p className="font-medium">{resultadoCRC.forma_juridica}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sede</p>
                    <p className="font-medium">{resultadoCRC.sede}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capital Social</p>
                    <p className="font-medium">{formatarMoeda(resultadoCRC.capital_social)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Representantes</p>
                  {resultadoCRC.representantes.map((r: any, i: number) => (
                    <p key={i} className="text-sm">
                      {r.nome} - {r.cargo} (CC: {r.cc_nif})
                    </p>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Certidão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagamentos */}
      {abaAtiva === 'pagamentos' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MB WAY</CardTitle>
              <CardDescription>Envie pedidos de pagamento MB WAY</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Valor (€)"
                  type="number"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                />
                <Input
                  placeholder="Telemóvel"
                  value={telefoneMBWay}
                  onChange={(e) => setTelefoneMBWay(e.target.value)}
                />
              </div>
              <Button onClick={handleCriarMBWay} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar Pedido MB WAY
              </Button>

              <div className="space-y-2">
                {pagamentosMBWay.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{formatarMoeda(p.valor)}</p>
                      <p className="text-xs text-muted-foreground">{p.telefone}</p>
                    </div>
                    <Badge 
                      variant={p.status === 'autorizado' ? 'default' : p.status === 'rejeitado' ? 'destructive' : 'outline'}
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referência Multibanco</CardTitle>
              <CardDescription>Gere referências MB para pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Valor (€)"
                  type="number"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                />
                <Button onClick={handleCriarMultibanco} disabled={loading}>
                  Gerar Referência
                </Button>
              </div>

              {referenciaMultibanco && (
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Entidade</p>
                  <p className="text-2xl font-bold">{referenciaMultibanco.entidade}</p>
                  <p className="text-sm text-muted-foreground mb-1 mt-3">Referência</p>
                  <p className="text-2xl font-bold">{referenciaMultibanco.referencia}</p>
                  <p className="text-sm text-muted-foreground mb-1 mt-3">Valor</p>
                  <p className="text-xl font-semibold">{formatarMoeda(referenciaMultibanco.valor)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* LinkedIn */}
      {abaAtiva === 'linkedin' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Contacto LinkedIn</CardTitle>
              <CardDescription>Importe perfis do LinkedIn para a base de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="URL do perfil LinkedIn"
                  value={urlLinkedIn}
                  onChange={(e) => setUrlLinkedIn(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleImportarLinkedIn} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Linkedin className="h-4 w-4" />}
                  Importar
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Ou pesquise na rede</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome ou empresa"
                    value={termoLinkedIn}
                    onChange={(e) => setTermoLinkedIn(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handlePesquisarLinkedIn} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {resultadosLinkedIn.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-sm text-muted-foreground">{c.cargo} @ {c.empresa}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {contactosLinkedIn.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contactos Importados ({contactosLinkedIn.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contactosLinkedIn.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{c.nome}</p>
                        <p className="text-sm text-muted-foreground">{c.cargo} @ {c.empresa}</p>
                        {c.email && <p className="text-xs text-blue-600">{c.email}</p>}
                      </div>
                      <Badge>Importado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
