import { useState } from 'react'
import { Scale, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { usePortalClienteStore } from '../stores/portalClienteStore'
import { formatarData, formatarMoeda } from '../lib/utils'
import type { Processo, Fatura, Documento } from '../types'

export function PortalClienteLogin() {
  const { loginCliente, clienteLogado, logoutCliente, mensagens, enviarMensagem, marcarComoLida, portalDados } = usePortalClienteStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'processos' | 'faturas' | 'documentos' | 'mensagens'>('processos')
  const [novaMensagem, setNovaMensagem] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const cliente = await loginCliente(email, password)
    setLoading(false)
    if (!cliente) {
      setErro('Email ou palavra-passe inválidos')
    } else {
      setErro('')
    }
  }

  if (clienteLogado) {
    const cliente = portalDados.cliente
    if (!cliente) return null

    const meusProcessos = portalDados.processos
    const minhasFaturas = portalDados.faturas
    const meusDocumentos = portalDados.documentos
    const minhasMensagens = mensagens.filter((m) =>
      meusProcessos.some((p) => p.id === m.processo_id)
    )

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg">Portal do Cliente</h1>
                <p className="text-sm text-muted-foreground">{cliente.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{cliente.email}</p>
                <p className="text-xs text-muted-foreground">NIF: {cliente.nif}</p>
              </div>
              <Button variant="outline" onClick={logoutCliente}>Sair</Button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-2 mb-6">
            {[
              { id: 'processos', label: 'Meus Processos', badge: meusProcessos.length },
              { id: 'faturas', label: 'Faturas', badge: minhasFaturas.length },
              { id: 'documentos', label: 'Documentos', badge: meusDocumentos.length },
              { id: 'mensagens', label: 'Mensagens', badge: minhasMensagens.filter((m) => !m.lida).length },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={abaAtiva === tab.id ? 'default' : 'outline'}
                onClick={() => setAbaAtiva(tab.id as any)}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="space-y-4">
            {abaAtiva === 'processos' && (
              <div className="grid gap-4">
                {meusProcessos.map((processo: Processo) => (
                  <Card key={processo.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{processo.numero}</h3>
                          <p className="text-muted-foreground">{processo.descricao}</p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Área: {processo.area_direito}</span>
                            <span>Status: <span className="capitalize">{processo.status}</span></span>
                            <span>Abertura: {formatarData(processo.data_abertura)}</span>
                          </div>
                          {processo.tribunal && (
                            <p className="text-sm text-muted-foreground mt-1">{processo.tribunal}</p>
                          )}
                        </div>
                        {processo.valor_causa && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor da Causa</p>
                            <p className="font-semibold">{formatarMoeda(processo.valor_causa)}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {abaAtiva === 'faturas' && (
              <div className="space-y-4">
                {minhasFaturas.map((fatura: Fatura) => (
                  <Card key={fatura.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{fatura.numero}</h3>
                          <p className="text-sm text-muted-foreground">
                            Emitida: {formatarData(fatura.data_emissao)} | 
                            Vencimento: {formatarData(fatura.data_vencimento)}
                          </p>
                          <p className="text-sm mt-1">
                            Status: <span className={`capitalize font-medium ${
                              fatura.status === 'paga' ? 'text-green-600' : 
                              fatura.status === 'atrasada' ? 'text-red-600' : 'text-orange-600'
                            }`}>{fatura.status}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatarMoeda(fatura.valor_total)}</p>
                          <p className="text-xs text-muted-foreground">
                            {fatura.itens.length} item(s)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {abaAtiva === 'documentos' && (
              <div className="grid gap-4">
                {meusDocumentos.map((doc: Documento) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">PDF</span>
                        </div>
                        <div>
                          <p className="font-medium">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('pt-PT')} • 
                            {(doc.tamanho / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {abaAtiva === 'mensagens' && (
              <div className="max-w-2xl mx-auto">
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escreva uma mensagem para o seu advogado..."
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                      />
                      <Button 
                        onClick={() => {
                          if (novaMensagem.trim() && meusProcessos[0]) {
                            enviarMensagem({
                              processo_id: meusProcessos[0].id,
                              remetente: 'cliente',
                              autor_id: cliente.id,
                              autor_nome: cliente.nome,
                              mensagem: novaMensagem,
                              lida: false,
                            })
                            setNovaMensagem('')
                          }
                        }}
                      >
                        Enviar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {minhasMensagens.map((msg) => (
                    <Card 
                      key={msg.id} 
                      className={msg.remetente === 'advogado' && !msg.lida ? 'border-blue-300' : ''}
                      onClick={() => msg.remetente === 'advogado' && marcarComoLida(msg.id)}
                    >
                      <CardContent className="p-4">
                        <div className={`flex ${msg.remetente === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${
                            msg.remetente === 'cliente' ? 'bg-blue-100' : 'bg-gray-100'
                          } rounded-lg p-3`}>
                            <p className="text-sm font-medium mb-1">{msg.autor_nome}</p>
                            <p className="text-sm">{msg.mensagem}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.data_envio).toLocaleString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Tela de Login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Scale className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Portal do Cliente</CardTitle>
          <CardDescription>
            Aceda aos seus processos, faturas e documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{erro}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Dados de teste: joao.ferreira@email.pt / 123456
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
