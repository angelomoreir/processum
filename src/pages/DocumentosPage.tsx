import { useState } from 'react'
import { FileText, Folder, Search, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useClientesStore } from '../stores/clientesStore'
import { useProcessosStore } from '../stores/processosStore'
import { useDocumentosStore } from '../stores/documentosStore'

function formatarTamanho(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function DocumentosPage() {
  const { clientes } = useClientesStore()
  const { processos } = useProcessosStore()
  const { documentos, addDocumento } = useDocumentosStore()
  const [filtro, setFiltro] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null)
  const [processoSelecionado, setProcessoSelecionado] = useState<string | null>(null)

  const processosFiltrados = processoSelecionado
    ? processos.filter((p) => p.id === processoSelecionado)
    : clienteSelecionado
    ? processos.filter((p) => p.cliente_id === clienteSelecionado)
    : processos

  const documentosFiltrados = documentos.filter((doc) => {
    const matchFiltro = doc.nome.toLowerCase().includes(filtro.toLowerCase())
    const matchProcesso = processoSelecionado ? doc.processo_id === processoSelecionado : true
    const matchCliente = clienteSelecionado
      ? processos.find((p) => p.id === doc.processo_id)?.cliente_id === clienteSelecionado ||
        doc.cliente_id === clienteSelecionado
      : true
    return matchFiltro && matchProcesso && matchCliente
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Repositório documental por cliente e processo
          </p>
        </div>
        <Button
          onClick={() => {
            // Simula upload de documento
            const nome = prompt('Nome do documento:', 'Novo Documento.pdf')
            if (nome) {
              addDocumento({
                nome,
                tipo: 'application/pdf',
                tamanho: Math.floor(Math.random() * 1000000),
                url: `/docs/${nome}`,
                processo_id: processoSelecionado || undefined,
                cliente_id: clienteSelecionado || undefined,
                uploaded_by: '1',
                versao: 1,
              })
            }
          }}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant={clienteSelecionado === null ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setClienteSelecionado(null)
                  setProcessoSelecionado(null)
                }}
              >
                <Folder className="mr-2 h-4 w-4" />
                Todos os clientes
              </Button>
              {clientes.map((cliente) => (
                <Button
                  key={cliente.id}
                  variant={clienteSelecionado === cliente.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setClienteSelecionado(cliente.id)
                    setProcessoSelecionado(null)
                  }}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  {cliente.nome}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {clienteSelecionado
                  ? clientes.find((c) => c.id === clienteSelecionado)?.nome
                  : 'Todos os Processos'}
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar documentos..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clienteSelecionado && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Processos</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={processoSelecionado === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProcessoSelecionado(null)}
                  >
                    Todos
                  </Button>
                  {processosFiltrados.map((processo) => (
                    <Button
                      key={processo.id}
                      variant={processoSelecionado === processo.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProcessoSelecionado(processo.id)}
                    >
                      {processo.numero}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {documentosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum documento encontrado</p>
                  <p className="text-sm">Selecione um cliente ou faça upload de documentos</p>
                </div>
              ) : (
                documentosFiltrados.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatarTamanho(doc.tamanho)} • Versão {doc.versao}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
