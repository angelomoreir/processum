import { useState } from 'react'
import { Send, MessageSquare, Mail, Smartphone, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useComunicacoesStore } from '../stores/comunicacoesStore'
import { useClientesStore } from '../stores/clientesStore'
import { useProcessosStore } from '../stores/processosStore'
import type { Comunicacao } from '../stores/comunicacoesStore'

const TIPO_ICONS = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageSquare,
  notificacao_push: Send,
}

const TIPO_LABELS = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  notificacao_push: 'Push',
}

const STATUS_COLORS = {
  pendente: 'bg-yellow-100 text-yellow-800',
  enviado: 'bg-blue-100 text-blue-800',
  entregue: 'bg-green-100 text-green-800',
  lido: 'bg-purple-100 text-purple-800',
  falhado: 'bg-red-100 text-red-800',
}

export function ComunicacoesPage() {
  const { comunicacoes, templates, enviarComunicacao, agendarComunicacao, aplicarTemplate } = useComunicacoesStore()
  const { clientes } = useClientesStore()
  const { processos } = useProcessosStore()

  const [abaAtiva, setAbaAtiva] = useState<'enviar' | 'historico' | 'templates'>('enviar')
  const [tipo, setTipo] = useState<'email' | 'sms' | 'whatsapp'>('email')
  const [destinatario, setDestinatario] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [templateSelecionado, setTemplateSelecionado] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [agendar, setAgendar] = useState(false)
  const [dataAgendamento, setDataAgendamento] = useState('')

  const handleAplicarTemplate = () => {
    if (!templateSelecionado) return
    const processo = processos.find((p) => p.id === processoId)
    const cliente = clientes.find((c) => c.id === processo?.cliente_id)
    
    if (!processo || !cliente) return

    const variaveis: Record<string, string> = {
      nome_cliente: cliente.nome,
      numero_processo: processo.numero,
      nome_escritorio: 'Escritório de Advocacia',
      data_prazo: new Date(Date.now() + 15 * 86400000).toLocaleDateString('pt-PT'),
      tipo_prazo: 'Contestação',
    }

    const texto = aplicarTemplate(templateSelecionado, variaveis)
    setMensagem(texto)
    
    const template = templates.find((t) => t.id === templateSelecionado)
    if (template?.assunto) {
      setAssunto(template.assunto)
    }
    if (template) {
      setTipo(template.tipo as any)
    }
  }

  const handleEnviar = async () => {
    const comunicacaoData = {
      tipo,
      destinatario,
      assunto,
      mensagem,
      processo_id: processoId,
      cliente_id: processos.find((p) => p.id === processoId)?.cliente_id,
    }

    if (agendar && dataAgendamento) {
      agendarComunicacao(comunicacaoData, dataAgendamento)
    } else {
      await enviarComunicacao(comunicacaoData)
    }

    // Reset
    setDestinatario('')
    setAssunto('')
    setMensagem('')
    setProcessoId('')
    setTemplateSelecionado('')
    setAgendar(false)
    setDataAgendamento('')
    setAbaAtiva('historico')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Centro de Comunicações</h1>
        <p className="text-muted-foreground">Envio de emails, SMS e WhatsApp para clientes</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'enviar', label: 'Enviar', icon: Send },
          { id: 'historico', label: 'Histórico', icon: Clock },
          { id: 'templates', label: 'Templates', icon: MessageSquare },
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

      {abaAtiva === 'enviar' && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Comunicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Processo</label>
                <select
                  value={processoId}
                  onChange={(e) => {
                    setProcessoId(e.target.value)
                    const processo = processos.find((p) => p.id === e.target.value)
                    const cliente = clientes.find((c) => c.id === processo?.cliente_id)
                    if (cliente) setDestinatario(cliente.email)
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  <option value="">Selecione um processo</option>
                  {processos.map((p) => (
                    <option key={p.id} value={p.id}>{p.numero} - {p.descricao}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Template (opcional)</label>
                <div className="flex gap-2">
                  <select
                    value={templateSelecionado}
                    onChange={(e) => setTemplateSelecionado(e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3"
                  >
                    <option value="">Sem template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                  {templateSelecionado && (
                    <Button variant="outline" onClick={handleAplicarTemplate}>
                      Aplicar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(['email', 'sms', 'whatsapp'] as const).map((t) => (
                <Button
                  key={t}
                  variant={tipo === t ? 'default' : 'outline'}
                  onClick={() => setTipo(t)}
                  className="w-full"
                >
                  {TIPO_LABELS[t]}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destinatário</label>
              <Input
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder={tipo === 'email' ? 'email@exemplo.pt' : '+351 912345678'}
              />
            </div>

            {tipo === 'email' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Assunto do email"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem</label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva a mensagem..."
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={agendar}
                  onChange={(e) => setAgendar(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Agendar envio</span>
              </label>
              {agendar && (
                <Input
                  type="datetime-local"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  className="w-auto"
                />
              )}
            </div>

            <Button onClick={handleEnviar} className="w-full" disabled={!destinatario || !mensagem}>
              <Send className="mr-2 h-4 w-4" />
              {agendar ? 'Agendar Envio' : 'Enviar Agora'}
            </Button>
          </CardContent>
        </Card>
      )}

      {abaAtiva === 'historico' && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Envios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comunicacoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma comunicação enviada</p>
              ) : (
                comunicacoes.map((com: Comunicacao) => {
                  const Icon = TIPO_ICONS[com.tipo]
                  return (
                    <div key={com.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{com.destinatario}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{com.mensagem}</p>
                          {com.data_agendamento && (
                            <p className="text-xs text-orange-600">
                              Agendado para: {new Date(com.data_agendamento).toLocaleString('pt-PT')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={STATUS_COLORS[com.status]}>
                          {com.status}
                        </Badge>
                        {com.data_envio && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(com.data_envio).toLocaleString('pt-PT')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {abaAtiva === 'templates' && (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{template.nome}</h3>
                    <Badge variant="outline" className="mt-1">{TIPO_LABELS[template.tipo]}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">{template.assunto}</p>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Variáveis disponíveis:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variaveis.map((v) => (
                          <span key={v} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <pre className="mt-3 text-xs bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {template.corpo}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
