import { useState } from 'react'
import { Clock, MapPin, Video, Plus, Check, X, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAgendamentoStore } from '../stores/agendamentoStore'
import { useClientesStore } from '../stores/clientesStore'
import { useAuthStore } from '../stores/authStore'

const TIPO_LABELS = {
  consulta: 'Consulta',
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  prazo: 'Prazo',
  outro: 'Outro',
}

const TIPO_COLORS = {
  consulta: 'bg-blue-100 text-blue-800',
  audiencia: 'bg-red-100 text-red-800',
  reuniao: 'bg-green-100 text-green-800',
  prazo: 'bg-yellow-100 text-yellow-800',
  outro: 'bg-gray-100 text-gray-800',
}

export function AgendamentoPage() {
  const { 
    salas, 
    addAgendamento, 
    getAgendamentosByData,
    getConflitos,
    sincronizarGoogleCalendar,
    sincronizarOutlook,
  } = useAgendamentoStore()
  const { clientes } = useClientesStore()
  const { user } = useAuthStore()
  
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    tipo: 'consulta' as const,
    data_inicio: '',
    data_fim: '',
    cliente_id: '',
    processo_id: '',
    sala: '',
    descricao: '',
  })

  const agendamentosDia = getAgendamentosByData(dataSelecionada)

  const handleSubmit = () => {
    if (!novoEvento.titulo || !novoEvento.data_inicio || !novoEvento.data_fim) return
    
    const conflitos = getConflitos(novoEvento.data_inicio, novoEvento.data_fim, user?.id || '')
    if (conflitos.length > 0) {
      alert('Existe conflito de horário com outro agendamento!')
      return
    }
    
    addAgendamento({
      ...novoEvento,
      responsavel_id: user?.id || '',
    })
    
    setMostrarModal(false)
    setNovoEvento({
      titulo: '',
      tipo: 'consulta',
      data_inicio: '',
      data_fim: '',
      cliente_id: '',
      processo_id: '',
      sala: '',
      descricao: '',
    })
  }

  const handleSincronizar = async (tipo: 'google' | 'outlook') => {
    setSincronizando(true)
    if (tipo === 'google') {
      await sincronizarGoogleCalendar()
    } else {
      await sincronizarOutlook()
    }
    setSincronizando(false)
    alert(`Sincronização com ${tipo === 'google' ? 'Google Calendar' : 'Outlook'} concluída (simulação)`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamento</h1>
          <p className="text-muted-foreground">Gestão de salas e calendário</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSincronizar('google')} disabled={sincronizando}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Google Calendar
          </Button>
          <Button variant="outline" onClick={() => handleSincronizar('outlook')} disabled={sincronizando}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Outlook
          </Button>
          <Button onClick={() => setMostrarModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="mb-4"
            />
            
            <div className="space-y-2">
              {agendamentosDia.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum agendamento para este dia</p>
              ) : (
                agendamentosDia.map((ag) => (
                  <div key={ag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded ${TIPO_COLORS[ag.tipo].split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`} />
                      <div>
                        <p className="font-medium">{ag.titulo}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(ag.data_inicio).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(ag.data_fim).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          {ag.sala && (
                            <>
                              <MapPin className="h-3 w-3 ml-2" />
                              {salas.find((s) => s.id === ag.sala)?.nome}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={TIPO_COLORS[ag.tipo]}>{TIPO_LABELS[ag.tipo]}</Badge>
                      {ag.status === 'confirmado' && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salas.map((sala) => (
                <div key={sala.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{sala.nome}</p>
                  <p className="text-sm text-muted-foreground">{sala.localizacao}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {sala.recursos.map((r) => (
                      <Badge key={r} variant="outline" className="text-xs">
                        {r === 'video' && <Video className="h-3 w-3 mr-1" />}
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Novo Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título do evento"
                value={novoEvento.titulo}
                onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
              />
              
              <select
                value={novoEvento.tipo}
                onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value as any })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                {Object.entries(TIPO_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="datetime-local"
                  value={novoEvento.data_inicio}
                  onChange={(e) => setNovoEvento({ ...novoEvento, data_inicio: e.target.value })}
                />
                <Input
                  type="datetime-local"
                  value={novoEvento.data_fim}
                  onChange={(e) => setNovoEvento({ ...novoEvento, data_fim: e.target.value })}
                />
              </div>
              
              <select
                value={novoEvento.cliente_id}
                onChange={(e) => setNovoEvento({ ...novoEvento, cliente_id: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              
              <select
                value={novoEvento.sala}
                onChange={(e) => setNovoEvento({ ...novoEvento, sala: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Selecione a sala</option>
                {salas.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
              
              <textarea
                placeholder="Descrição"
                value={novoEvento.descricao}
                onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
              />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMostrarModal(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  <Check className="mr-2 h-4 w-4" />
                  Agendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
