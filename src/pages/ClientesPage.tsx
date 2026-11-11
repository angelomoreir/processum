import { useState } from 'react'
import { Plus, Search, Phone, Mail, MapPin, Edit, Trash2, Key } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { ModalCliente } from '../components/modais/ModalCliente'
import { useClientesStore } from '../stores/clientesStore'
import { usePortalClienteStore } from '../stores/portalClienteStore'
import { cn } from '../lib/utils'
import type { Cliente } from '../types'

const ESTAGIO_LABELS: Record<string, string> = {
  lead: 'Lead',
  contatado: 'Contatado',
  reuniao: 'Reunião Agendada',
  contratado: 'Contratado',
  ativo: 'Cliente Ativo',
}

const ESTAGIO_COLORS: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-800',
  contatado: 'bg-blue-100 text-blue-800',
  reuniao: 'bg-yellow-100 text-yellow-800',
  contratado: 'bg-green-100 text-green-800',
  ativo: 'bg-emerald-100 text-emerald-800',
}

export function ClientesPage() {
  const { clientes, deleteCliente } = useClientesStore()
  const { acessos, criarAcesso, desativarAcesso, reativarAcesso } = usePortalClienteStore()
  const [filtro, setFiltro] = useState('')
  const [estagioFiltro, setEstagioFiltro] = useState<string>('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)

  const clientesFiltrados = clientes.filter((cliente) => {
    const matchFiltro =
      cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.email.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.nif.includes(filtro)
    const matchEstagio = estagioFiltro === 'todos' || cliente.estagio === estagioFiltro
    return matchFiltro && matchEstagio
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestão de clientes e pipeline de captação
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setClienteEditando(null)
            setModalAberto(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar clientes..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={estagioFiltro}
                onChange={(e) => setEstagioFiltro(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="todos">Todos os estágios</option>
                <option value="lead">Lead</option>
                <option value="contatado">Contatado</option>
                <option value="reuniao">Reunião Agendada</option>
                <option value="contratado">Contratado</option>
                <option value="ativo">Cliente Ativo</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{cliente.nome}</h3>
                      <Badge className={ESTAGIO_COLORS[cliente.estagio]}>
                        {ESTAGIO_LABELS[cliente.estagio]}
                      </Badge>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const temAcesso = acessos.find(a => a.cliente_id === cliente.id)
                          if (temAcesso && temAcesso.ativo) {
                            desativarAcesso(temAcesso.id)
                          } else if (temAcesso && !temAcesso.ativo) {
                            reativarAcesso(temAcesso.id)
                          } else {
                            criarAcesso(cliente.id, cliente.email, '123456')
                          }
                        }}
                        className={cn(
                          "text-[10px] px-2 py-1 rounded font-bold transition-all border",
                          acessos.find(a => a.cliente_id === cliente.id)?.ativo 
                            ? "bg-green-500 text-white border-green-600" 
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-primary/10 hover:text-primary hover:border-primary"
                        )}
                      >
                        {(() => {
                          const acesso = acessos.find(a => a.cliente_id === cliente.id)
                          if (!acesso) return 'ATIVAR PORTAL'
                          return acesso.ativo ? 'PORTAL ATIVO' : 'PORTAL INATIVO'
                        })()}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      NIF: {cliente.nif}
                    </p>
                    {cliente.area_direito && (
                      <p className="text-sm text-muted-foreground">
                        Área: {cliente.area_direito}
                      </p>
                    )}
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.telefone}
                      </span>
                      {cliente.morada && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {cliente.morada}
                        </span>
                      )}
                    </div>
                    {cliente.notas && (
                      <p className="pt-2 text-sm text-muted-foreground">
                        Notas: {cliente.notas}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.alert('BOTÃO DETETADO')
                      }}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setClienteEditando(cliente)
                        setModalAberto(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir ${cliente.nome}?`)) {
                          deleteCliente(cliente.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ESTAGIO_LABELS).map(([key, label]) => {
                const count = clientes.filter((c) => c.estagio === key).length
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <ModalCliente
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        cliente={clienteEditando}
      />
    </div>
  )
}
