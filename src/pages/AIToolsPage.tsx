import { useState } from 'react'
import { Bot, FileText, Wand2, Sparkles, MessageSquare, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAIStore } from '../stores/aiStore'
import { useDocumentosStore } from '../stores/documentosStore'

const MINUTAS_DISPONIVEIS = [
  { id: 'procuracao', nome: 'Procuração', descricao: 'Procuração para representação judicial' },
  { id: 'peticao_inicial', nome: 'Petição Inicial', descricao: 'Modelo de petição inicial' },
  { id: 'contestacao', nome: 'Contestação', descricao: 'Resposta à petição inicial' },
]

export function AIToolsPage() {
  const { isAnalyzing, analisarDocumento, gerarMinuta, chatbotConsulta } = useAIStore()
  const { documentos } = useDocumentosStore()
  
  const [abaAtiva, setAbaAtiva] = useState<'minutas' | 'chatbot' | 'analise'>('minutas')
  const [minutaSelecionada, setMinutaSelecionada] = useState('')
  const [dadosMinuta, setDadosMinuta] = useState<Record<string, string>>({})
  const [minutaGerada, setMinutaGerada] = useState('')
  const [chatPergunta, setChatPergunta] = useState('')
  const [chatResposta, setChatResposta] = useState('')
  const [documentoSelecionado, setDocumentoSelecionado] = useState('')
  const [analiseResultado, setAnaliseResultado] = useState('')

  const handleGerarMinuta = async () => {
    const minuta = await gerarMinuta(minutaSelecionada, dadosMinuta)
    setMinutaGerada(minuta.conteudo)
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatPergunta.trim()) return
    const resposta = await chatbotConsulta(chatPergunta)
    setChatResposta(resposta)
  }

  const handleAnalisarDocumento = async () => {
    const doc = documentos.find((d) => d.id === documentoSelecionado)
    if (!doc) return
    const resultado = await analisarDocumento(doc)
    setAnaliseResultado(JSON.stringify(resultado, null, 2))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente AI</h1>
        <p className="text-muted-foreground">Ferramentas de inteligência artificial para automatizar tarefas jurídicas</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={abaAtiva === 'minutas' ? 'default' : 'outline'}
          onClick={() => setAbaAtiva('minutas')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Gerar Minutas
        </Button>
        <Button
          variant={abaAtiva === 'chatbot' ? 'default' : 'outline'}
          onClick={() => setAbaAtiva('chatbot')}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Consulta Jurídica
        </Button>
        <Button
          variant={abaAtiva === 'analise' ? 'default' : 'outline'}
          onClick={() => setAbaAtiva('analise')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Análise de Documentos
        </Button>
      </div>

      {abaAtiva === 'minutas' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Minuta</CardTitle>
              <CardDescription>Preencha os dados para gerar uma minuta automática</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Documento</label>
                <select
                  value={minutaSelecionada}
                  onChange={(e) => { setMinutaSelecionada(e.target.value); setDadosMinuta({}); setMinutaGerada('') }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  <option value="">Selecione um tipo</option>
                  {MINUTAS_DISPONIVEIS.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              {minutaSelecionada && (
                <div className="space-y-3">
                  {minutaSelecionada === 'procuracao' && (
                    <>
                      <Input placeholder="Nome do cliente" value={dadosMinuta.nome_cliente || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, nome_cliente: e.target.value})} />
                      <Input placeholder="Nome do advogado" value={dadosMinuta.nome_advogado || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, nome_advogado: e.target.value})} />
                      <Input placeholder="Número OAB" value={dadosMinuta.numero_oab || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, numero_oab: e.target.value})} />
                      <Input placeholder="Número do processo" value={dadosMinuta.numero_processo || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, numero_processo: e.target.value})} />
                    </>
                  )}
                  {minutaSelecionada === 'peticao_inicial' && (
                    <>
                      <Input placeholder="Nome do autor" value={dadosMinuta.nome_autor || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, nome_autor: e.target.value})} />
                      <Input placeholder="Nome do réu" value={dadosMinuta.nome_reu || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, nome_reu: e.target.value})} />
                      <Input placeholder="Tipo de ação" value={dadosMinuta.tipo_acao || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, tipo_acao: e.target.value})} />
                      <Input placeholder="Tribunal" value={dadosMinuta.tribunal || ''} onChange={(e) => setDadosMinuta({...dadosMinuta, tribunal: e.target.value})} />
                    </>
                  )}
                  <Button onClick={handleGerarMinuta} disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Gerar Minuta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>Minuta gerada pelo assistente AI</CardDescription>
            </CardHeader>
            <CardContent>
              {minutaGerada ? (
                <div className="space-y-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg max-h-[400px] overflow-auto">
                    {minutaGerada}
                  </pre>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(minutaGerada)} className="w-full">
                    Copiar para Clipboard
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Selecione um tipo de minuta e preencha os dados para gerar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {abaAtiva === 'chatbot' && (
        <Card>
          <CardHeader>
            <CardTitle>Consulta Jurídica AI</CardTitle>
            <CardDescription>Pergunte sobre procedimentos jurídicos, prazos ou fundamentação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input
                placeholder="Ex: Qual o prazo para contestação?"
                value={chatPergunta}
                onChange={(e) => setChatPergunta(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              </Button>
            </form>

            {chatResposta && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{chatResposta}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Perguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {['Qual o prazo para contestação?', 'Como funciona uma ação de indemnização?', 'Quais as taxas de justiça?'].map((q) => (
                  <Button key={q} variant="outline" size="sm" onClick={() => { setChatPergunta(q); setChatResposta('') }}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {abaAtiva === 'analise' && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Documentos</CardTitle>
            <CardDescription>A IA analisa documentos e extrai informações relevantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <select
                value={documentoSelecionado}
                onChange={(e) => setDocumentoSelecionado(e.target.value)}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione um documento</option>
                {documentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
              <Button onClick={handleAnalisarDocumento} disabled={!documentoSelecionado || isAnalyzing}>
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analisar'}
              </Button>
            </div>

            {analiseResultado && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap">{analiseResultado}</pre>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
              <strong>Nota:</strong> Esta é uma simulação. Em produção, a IA analisaria o conteúdo real do documento e sugeriria prazos e entidades relevantes.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
