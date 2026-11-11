import { useState } from 'react'
import { FileSignature, CheckCircle, Upload, Users, Shield, Download, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useDocumentosStore } from '../stores/documentosStore'

interface Assinatura {
  id: string
  documento_id: string
  signatario_id: string
  signatario_nome: string
  signatario_email: string
  tipo: 'digital' | 'eletronica' | 'autenticada'
  status: 'pendente' | 'assinado' | 'recusado' | 'expirado'
  data_envio: string
  data_assinatura?: string
  hash_documento: string
  certificado_info?: {
    emitente: string
    valido_de: string
    valido_ate: string
    serie: string
  }
}

const MOCK_ASSINATURAS: Assinatura[] = [
  {
    id: '1',
    documento_id: '1',
    signatario_id: '1',
    signatario_nome: 'João Ferreira',
    signatario_email: 'joao@email.pt',
    tipo: 'digital',
    status: 'assinado',
    data_envio: '2024-01-15',
    data_assinatura: '2024-01-16',
    hash_documento: 'a1b2c3d4e5f6',
    certificado_info: {
      emitente: 'Cartão de Cidadão',
      valido_de: '2023-01-01',
      valido_ate: '2026-01-01',
      serie: 'CC123456',
    },
  },
  {
    id: '2',
    documento_id: '2',
    signatario_id: '2',
    signatario_nome: 'Maria Santos',
    signatario_email: 'maria@email.pt',
    tipo: 'eletronica',
    status: 'pendente',
    data_envio: '2024-02-01',
    hash_documento: 'b2c3d4e5f6g7',
  },
]

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  assinado: 'bg-green-100 text-green-800',
  recusado: 'bg-red-100 text-red-800',
  expirado: 'bg-gray-100 text-gray-800',
}

const TIPO_LABELS: Record<string, string> = {
  digital: 'Assinatura Digital (CC)',
  eletronica: 'Assinatura Eletrónica',
  autenticada: 'Assinatura Autenticada',
}

export function AssinaturaPage() {
  const { documentos } = useDocumentosStore()
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>(MOCK_ASSINATURAS)
  const [abaAtiva, setAbaAtiva] = useState<'solicitar' | 'pendentes' | 'assinados'>('solicitar')
  const [documentoId, setDocumentoId] = useState('')
  const [signatarioEmail, setSignatarioEmail] = useState('')
  const [signatarioNome, setSignatarioNome] = useState('')
  const [tipoAssinatura, setTipoAssinatura] = useState<'digital' | 'eletronica' | 'autenticada'>('eletronica')
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSolicitar = () => {
    setIsSimulating(true)
    
    // Simula processo de solicitação
    setTimeout(() => {
      const novaAssinatura: Assinatura = {
        id: crypto.randomUUID(),
        documento_id: documentoId,
        signatario_id: crypto.randomUUID(),
        signatario_nome: signatarioNome,
        signatario_email: signatarioEmail,
        tipo: tipoAssinatura,
        status: 'pendente',
        data_envio: new Date().toISOString(),
        hash_documento: Math.random().toString(36).substring(2, 15),
      }
      
      setAssinaturas([novaAssinatura, ...assinaturas])
      setIsSimulating(false)
      
      // Reset
      setDocumentoId('')
      setSignatarioEmail('')
      setSignatarioNome('')
      setAbaAtiva('pendentes')
    }, 2000)
  }

  const handleSimularAssinatura = (id: string) => {
    setIsSimulating(true)
    
    setTimeout(() => {
      setAssinaturas(assinaturas.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'assinado',
              data_assinatura: new Date().toISOString(),
              certificado_info: {
                emitente: tipoAssinatura === 'digital' ? 'Cartão de Cidadão' : 'DocuSign',
                valido_de: '2023-01-01',
                valido_ate: '2026-01-01',
                serie: 'SIG' + Math.random().toString(36).substring(2, 8).toUpperCase(),
              },
            }
          : a
      ))
      setIsSimulating(false)
    }, 1500)
  }

  const assinaturasFiltradas = assinaturas.filter((a) => {
    if (abaAtiva === 'pendentes') return a.status === 'pendente'
    if (abaAtiva === 'assinados') return a.status === 'assinado'
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura Digital</h1>
        <p className="text-muted-foreground">Gestão de assinaturas digitais e certificação de documentos</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'solicitar', label: 'Solicitar Assinatura', icon: FileSignature },
          { id: 'pendentes', label: 'Pendentes', icon: Clock },
          { id: 'assinados', label: 'Assinados', icon: CheckCircle },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={abaAtiva === tab.id ? 'default' : 'outline'}
            onClick={() => setAbaAtiva(tab.id as any)}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
            {tab.id === 'pendentes' && (
              <Badge variant="secondary" className="ml-2">
                {assinaturas.filter((a) => a.status === 'pendente').length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {abaAtiva === 'solicitar' && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Nova Assinatura</CardTitle>
            <CardDescription>Envie um documento para assinatura digital</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Documento</label>
              <select
                value={documentoId}
                onChange={(e) => setDocumentoId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione um documento</option>
                {documentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Signatário</label>
                <Input
                  value={signatarioNome}
                  onChange={(e) => setSignatarioNome(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email do Signatário</label>
                <Input
                  type="email"
                  value={signatarioEmail}
                  onChange={(e) => setSignatarioEmail(e.target.value)}
                  placeholder="email@exemplo.pt"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Assinatura</label>
              <div className="grid grid-cols-3 gap-4">
                {(['digital', 'eletronica', 'autenticada'] as const).map((tipo) => (
                  <div
                    key={tipo}
                    onClick={() => setTipoAssinatura(tipo)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      tipoAssinatura === tipo ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted'
                    }`}
                  >
                    <Shield className={`h-6 w-6 mb-2 ${tipo === 'digital' ? 'text-green-600' : tipo === 'eletronica' ? 'text-blue-600' : 'text-purple-600'}`} />
                    <p className="font-medium text-sm">{TIPO_LABELS[tipo]}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tipo === 'digital' && 'Certificado CC/ Chave Móvel'}
                      {tipo === 'eletronica' && 'DocuSign / Adobe Sign'}
                      {tipo === 'autenticada' && 'Notário / Advogado'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSolicitar} 
              className="w-full"
              disabled={!documentoId || !signatarioEmail || !signatarioNome || isSimulating}
            >
              {isSimulating ? (
                <>Processando...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Solicitar Assinatura
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {abaAtiva !== 'solicitar' && (
        <div className="space-y-4">
          {assinaturasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileSignature className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {abaAtiva === 'pendentes' 
                    ? 'Nenhuma assinatura pendente' 
                    : 'Nenhum documento assinado'}
                </p>
              </CardContent>
            </Card>
          ) : (
            assinaturasFiltradas.map((assinatura) => (
              <Card key={assinatura.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {documentos.find((d) => d.id === assinatura.documento_id)?.nome || 'Documento'}
                        </h3>
                        <Badge className={STATUS_COLORS[assinatura.status]}>
                          {assinatura.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {assinatura.signatario_nome} ({assinatura.signatario_email})
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4" />
                        {TIPO_LABELS[assinatura.tipo]}
                      </div>

                      {assinatura.certificado_info && (
                        <div className="bg-gray-50 p-3 rounded mt-2 text-sm space-y-1">
                          <p><strong>Certificado:</strong> {assinatura.certificado_info.emitente}</p>
                          <p><strong>Série:</strong> {assinatura.certificado_info.serie}</p>
                          <p><strong>Válido até:</strong> {assinatura.certificado_info.valido_ate}</p>
                          <p><strong>Hash:</strong> {assinatura.hash_documento}</p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Enviado em: {new Date(assinatura.data_envio).toLocaleDateString('pt-PT')}
                        {assinatura.data_assinatura && (
                          <> | Assinado em: {new Date(assinatura.data_assinatura).toLocaleDateString('pt-PT')}</>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {assinatura.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => handleSimularAssinatura(assinatura.id)}
                          disabled={isSimulating}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Simular Assinatura
                        </Button>
                      )}
                      {assinatura.status === 'assinado' && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download com Prova
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
