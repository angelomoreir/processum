import { useState } from 'react'
import { Mic, Video, Upload, FileText, Play, Pause, Clock, Save, Wand2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useProcessosStore } from '../stores/processosStore'

interface Transcricao {
  id: string
  processo_id: string
  data_audiencia: string
  tipo: 'gratuita' | 'premium'
  status: 'upload' | 'processando' | 'concluido'
  progresso: number
  audio_url?: string
  transcricao?: string
  resumo?: string
  pontos_chave?: string[]
  duracao_minutos?: number
  criado_em: string
}

const MOCK_TRANSCRICOES: Transcricao[] = [
  {
    id: '1',
    processo_id: '1',
    data_audiencia: '2024-01-15',
    tipo: 'premium',
    status: 'concluido',
    progresso: 100,
    transcricao: `[00:00] Audiência iniciada. Presentes: Juiz Dr. Silva, Advogado Dr. João, parte contrária.
[02:15] Parte autora apresenta alegações sobre responsabilidade civil.
[05:30] Advogado do réu contesta valores propostos.
[10:45] Discussão sobre culpa comparada.
[15:20] Juiz intervém para esclarecer pontos de facto.
[20:00] Tentativa de conciliação - sem acordo.
[25:30] Audiência marcada para julgamento: 15/03/2024.
[30:00] Audiência encerrada.`,
    resumo: 'Audiência sobre responsabilidade civil. Sem acordo nas tentativas de conciliação. Agendado julgamento para 15/03/2024.',
    pontos_chave: [
      'Sem acordo nas tentativas de conciliação',
      'Contestação sobre valores propostos',
      'Julgamento marcado para 15/03/2024',
    ],
    duracao_minutos: 30,
    criado_em: '2024-01-15',
  },
]

export function AudienciasPage() {
  const { processos } = useProcessosStore()
  const [transcricoes, setTranscricoes] = useState<Transcricao[]>(MOCK_TRANSCRICOES)
  const [abaAtiva, setAbaAtiva] = useState<'nova' | 'lista' | 'video'>('nova')
  const [processoId, setProcessoId] = useState('')
  const [dataAudiencia, setDataAudiencia] = useState('')
  const [tipoTranscricao, setTipoTranscricao] = useState<'gratuita' | 'premium'>('premium')
  const [loading, setLoading] = useState(false)
  const [transcricaoSelecionada, setTranscricaoSelecionada] = useState<Transcricao | null>(null)
  const [gravando, setGravando] = useState(false)
  const [tempoGravacao, setTempoGravacao] = useState(0)

  const handleUploadAudio = async () => {
    setLoading(true)
    
    // Simula upload e processamento
    const novaTranscricao: Transcricao = {
      id: crypto.randomUUID(),
      processo_id: processoId,
      data_audiencia: dataAudiencia,
      tipo: tipoTranscricao,
      status: 'processando',
      progresso: 0,
      criado_em: new Date().toISOString(),
    }
    
    setTranscricoes([novaTranscricao, ...transcricoes])
    
    // Simula progresso
    let progresso = 0
    const interval = setInterval(() => {
      progresso += 10
      setTranscricoes((prev) =>
        prev.map((t) =>
          t.id === novaTranscricao.id ? { ...t, progresso } : t
        )
      )
      
      if (progresso >= 100) {
        clearInterval(interval)
        // Gera conteúdo mock
        setTranscricoes((prev) =>
          prev.map((t) =>
            t.id === novaTranscricao.id
              ? {
                  ...t,
                  status: 'concluido',
                  transcricao: `[00:00] Audiência iniciada.\n[05:00] Discussão dos factos.\n[10:00] Apresentação de documentos.\n[15:00] Alegações finais.\n[20:00] Audiência encerrada.`,
                  resumo: 'Audiência realizada com apresentação de documentos e alegações.',
                  pontos_chave: ['Documentos apresentados', 'Alegações finais concluídas'],
                  duracao_minutos: 20,
                }
              : t
          )
        )
        setLoading(false)
      }
    }, 500)
  }

  const handleIniciarGravacao = () => {
    setGravando(true)
    setTempoGravacao(0)
    
    const interval = setInterval(() => {
      setTempoGravacao((t) => t + 1)
    }, 1000)
    
    // Para após 5 segundos em modo demo
    setTimeout(() => {
      clearInterval(interval)
      setGravando(false)
    }, 5000)
  }

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60)
    const s = segundos % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audiências & Transcrições</h1>
        <p className="text-muted-foreground">Transcreva audiências automaticamente com IA</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'nova', label: 'Nova Transcrição', icon: Upload },
          { id: 'lista', label: 'Transcrições', icon: FileText },
          { id: 'video', label: 'Videochamada', icon: Video },
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

      {abaAtiva === 'nova' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Áudio</CardTitle>
              <CardDescription>Faça upload do áudio da audiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Processo</label>
                <select
                  value={processoId}
                  onChange={(e) => setProcessoId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  <option value="">Selecione um processo</option>
                  {processos.map((p) => (
                    <option key={p.id} value={p.id}>{p.numero} - {p.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data da Audiência</label>
                <Input
                  type="date"
                  value={dataAudiencia}
                  onChange={(e) => setDataAudiencia(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Transcrição</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setTipoTranscricao('gratuita')}
                    className={`p-4 rounded-lg border cursor-pointer ${
                      tipoTranscricao === 'gratuita' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <p className="font-medium">Gratuita</p>
                    <p className="text-xs text-muted-foreground">Transcrição básica</p>
                    <p className="text-xs text-muted-foreground">Até 30 minutos</p>
                  </div>
                  <div
                    onClick={() => setTipoTranscricao('premium')}
                    className={`p-4 rounded-lg border cursor-pointer ${
                      tipoTranscricao === 'premium' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <p className="font-medium">Premium</p>
                    <p className="text-xs text-muted-foreground">+ Resumo automático</p>
                    <p className="text-xs text-muted-foreground">+ Pontos chave</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Arraste o arquivo de áudio</p>
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A até 500MB</p>
              </div>

              <Button 
                onClick={handleUploadAudio} 
                className="w-full"
                disabled={!processoId || !dataAudiencia || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Iniciar Transcrição
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gravar em Direto</CardTitle>
              <CardDescription>Grave a audiência diretamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Mic className={`mx-auto h-16 w-16 mb-4 ${gravando ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                <p className="text-4xl font-mono font-bold">{formatarTempo(tempoGravacao)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {gravando ? 'A gravar...' : 'Pronto para gravar'}
                </p>
              </div>

              <Button 
                onClick={handleIniciarGravacao}
                variant={gravando ? 'destructive' : 'default'}
                className="w-full"
                disabled={gravando}
              >
                {gravando ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Gravar (Demo 5s)
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Gravação
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Demo: Gravação automática por 5 segundos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {abaAtiva === 'lista' && (
        <div className="space-y-4">
          {transcricoes.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {processos.find((p) => p.id === t.processo_id)?.numero || 'Processo'}
                      </h3>
                      <Badge variant={t.tipo === 'premium' ? 'default' : 'outline'}>
                        {t.tipo}
                      </Badge>
                      <Badge variant={t.status === 'concluido' ? 'default' : 'outline'}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Audiência: {new Date(t.data_audiencia).toLocaleDateString('pt-PT')}
                    </p>
                    {t.duracao_minutos && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t.duracao_minutos} minutos
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTranscricaoSelecionada(t)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                </div>

                {t.status === 'processando' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Processando...</span>
                      <span>{t.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${t.progresso}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {transcricaoSelecionada && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transcrição Completa</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setTranscricaoSelecionada(null)}>
                    Fechar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {transcricaoSelecionada.resumo && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Resumo</h4>
                    <p className="text-sm">{transcricaoSelecionada.resumo}</p>
                  </div>
                )}

                {transcricaoSelecionada.pontos_chave && (
                  <div>
                    <h4 className="font-medium mb-2">Pontos Chave</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {transcricaoSelecionada.pontos_chave.map((ponto, i) => (
                        <li key={i}>{ponto}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Transcrição Completa</h4>
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                    {transcricaoSelecionada.transcricao}
                  </pre>
                </div>

                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar como Documento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {abaAtiva === 'video' && (
        <Card>
          <CardHeader>
            <CardTitle>Videochamada com Cliente</CardTitle>
            <CardDescription>Realize consultas remotas integradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-32 flex flex-col">
                <Video className="h-8 w-8 mb-2" />
                <span>Iniciar Zoom</span>
                <span className="text-xs text-muted-foreground">Integração simulada</span>
              </Button>
              <Button variant="outline" className="h-32 flex flex-col">
                <Video className="h-8 w-8 mb-2" />
                <span>Iniciar Teams</span>
                <span className="text-xs text-muted-foreground">Integração simulada</span>
              </Button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
              <strong>Nota:</strong> As integrações com Zoom e Microsoft Teams requerem 
              credenciais de API. Em modo de demonstração, estas funcionalidades simulam o fluxo.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
