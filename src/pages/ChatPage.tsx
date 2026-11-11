import { useState } from 'react'
import { Send, Hash, Phone, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'

export function ChatPage() {
  const { canais, canalAtivo, addMensagem, setCanalAtivo, getMensagensByCanal, getCanaisByUsuario } = useChatStore()
  const { user } = useAuthStore()
  const [novaMensagem, setNovaMensagem] = useState('')

  const canaisUsuario = user ? getCanaisByUsuario(user.id) : []
  const mensagensCanal = canalAtivo ? getMensagensByCanal(canalAtivo) : []
  const canalAtual = canais.find((c) => c.id === canalAtivo)

  const handleEnviar = () => {
    if (!novaMensagem.trim() || !canalAtivo || !user) return
    
    addMensagem({
      canal_id: canalAtivo,
      autor_id: user.id,
      autor_nome: user.nome,
      conteudo: novaMensagem,
      tipo: 'texto',
    })
    setNovaMensagem('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat Interno</h1>
        <p className="text-muted-foreground">Comunicação entre a equipa</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4 h-[calc(100vh-250px)]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Canais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {canaisUsuario.map((canal) => (
              <button
                key={canal.id}
                onClick={() => setCanalAtivo(canal.id)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  canalAtivo === canal.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{canal.nome}</span>
                  {canal.tipo === 'processo' && <Badge variant="outline" className="text-xs">Processo</Badge>}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          {canalAtual ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{canalAtual.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {canalAtual.participantes.length} participantes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagensCanal.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.autor_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.autor_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {msg.autor_id !== user?.id && (
                        <p className="text-xs font-semibold mb-1">{msg.autor_nome}</p>
                      )}
                      <p>{msg.conteudo}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardContent className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEnviar()}
                  />
                  <Button onClick={handleEnviar}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Selecione um canal para começar</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
