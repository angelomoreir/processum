import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, FileText, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ModalPrazo } from '../components/modais/ModalPrazo'
import { ModalHora } from '../components/modais/ModalHora'
import { useProcessosStore } from '../stores/processosStore'
import { usePrazosStore } from '../stores/prazosStore'
import { useHorasStore } from '../stores/horasStore'
import { useDocumentosStore } from '../stores/documentosStore'
import { formatarData, formatarMoeda } from '../lib/utils'
import type { Prazo, RegistroHora } from '../types'

export function ProcessoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getProcessoById } = useProcessosStore()
  const { prazos: todosPrazos, concluirPrazo } = usePrazosStore()
  const { horas: todosHoras } = useHorasStore()
  const { getDocumentosByProcesso } = useDocumentosStore()
  const processo = getProcessoById(id || '')
  const [abaAtiva, setAbaAtiva] = useState<'prazos' | 'horas' | 'documentos'>('prazos')
  const [modalPrazoAberto, setModalPrazoAberto] = useState(false)
  const [modalHoraAberto, setModalHoraAberto] = useState(false)

  const prazos = id ? todosPrazos.filter((p: Prazo) => p.processo_id === id) : []
  const horas = id ? todosHoras.filter((h: RegistroHora) => h.processo_id === id) : []
  const documentos = id ? getDocumentosByProcesso(id) : []

  const totalHoras = horas.reduce((acc: number, h: RegistroHora) => acc + h.duracao_minutos, 0)
  const totalFaturavel = horas
    .filter((h: RegistroHora) => h.faturavel)
    .reduce((acc: number, h: RegistroHora) => acc + (h.duracao_minutos / 60) * (h.valor_hora || 0), 0)

  if (!processo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Processo não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {processo.numero}
          </h1>
          <p className="text-muted-foreground">{processo.descricao}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Área do Direito</p>
                  <p className="font-medium">{processo.area_direito}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tribunal</p>
                  <p className="font-medium">{processo.tribunal}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Abertura</p>
                  <p className="font-medium">{formatarData(processo.data_abertura)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor da Causa</p>
                  <p className="font-medium">
                    {processo.valor_causa ? formatarMoeda(processo.valor_causa) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{processo.cliente?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Advogado Responsável</p>
                  <p className="font-medium">{processo.advogado_responsavel?.nome}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestão do Processo</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={abaAtiva === 'prazos' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAbaAtiva('prazos')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Prazos
                  </Button>
                  <Button
                    variant={abaAtiva === 'horas' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAbaAtiva('horas')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Horas
                  </Button>
                  <Button
                    variant={abaAtiva === 'documentos' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setAbaAtiva('documentos')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Documentos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {abaAtiva === 'prazos' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setModalPrazoAberto(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Prazo
                    </Button>
                  </div>
                  {prazos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4" />
                      <p>Nenhum prazo registado</p>
                      <p className="text-sm">Adicione um novo prazo para este processo</p>
                    </div>
                  ) : (
                    prazos.map((prazo) => (
                      <div
                        key={prazo.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{prazo.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {prazo.descricao}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Término: {formatarData(prazo.data_fim)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!prazo.concluido && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => concluirPrazo(prazo.id)}
                            >
                              Concluir
                            </Button>
                          )}
                          <Badge
                            className={
                              prazo.prioridade === 'urgente'
                                ? 'bg-red-500 text-white'
                                : prazo.prioridade === 'alta'
                                ? 'bg-orange-500 text-white'
                                : 'bg-blue-500 text-white'
                            }
                          >
                            {prazo.prioridade}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {abaAtiva === 'horas' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setModalHoraAberto(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Registar Horas
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total de Horas</p>
                        <p className="text-2xl font-bold">{Math.round(totalHoras / 60)}h</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Valor Faturável</p>
                        <p className="text-2xl font-bold">{formatarMoeda(totalFaturavel)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Registos</p>
                        <p className="text-2xl font-bold">{horas.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                  {horas.map((hora) => (
                    <div
                      key={hora.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{hora.atividade}</p>
                        <p className="text-sm text-muted-foreground">
                          {hora.duracao_minutos} minutos • {formatarData(hora.data)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hora.faturavel && (
                          <Badge variant="outline">Faturável</Badge>
                        )}
                        <span className="font-medium">
                          {formatarMoeda((hora.duracao_minutos / 60) * (hora.valor_hora || 0))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {abaAtiva === 'documentos' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                  {documentos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4" />
                      <p>Nenhum documento registado</p>
                      <p className="text-sm">Faça upload de documentos para este processo</p>
                    </div>
                  ) : (
                    documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{doc.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {(doc.tamanho / 1024).toFixed(0)} KB • v{doc.versao} • {formatarData(doc.created_at)}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Abrir
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor da Causa</span>
                  <span className="font-medium">
                    {processo.valor_causa ? formatarMoeda(processo.valor_causa) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horas Faturáveis</span>
                  <span className="font-medium">{formatarMoeda(totalFaturavel)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Registado</span>
                    <span className="font-bold">{formatarMoeda(totalFaturavel)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{processo.cliente?.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {processo.cliente?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {processo.cliente?.telefone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ModalPrazo
        isOpen={modalPrazoAberto}
        onClose={() => setModalPrazoAberto(false)}
        processoId={id}
      />
      <ModalHora
        isOpen={modalHoraAberto}
        onClose={() => setModalHoraAberto(false)}
        processoId={id}
      />
    </div>
  )
}
