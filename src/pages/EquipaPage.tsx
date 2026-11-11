import { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Clock, 
  MoreVertical,
  Briefcase,
  UserCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useEquipaStore } from '../stores/equipaStore'
import { useAuthStore } from '../stores/authStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

export function EquipaPage() {
  const { membros, convites, convidarMembro, removerMembro, cancelarConvite } = useEquipaStore()
  const { user } = useAuthStore()
  
  const [novoEmail, setNovoEmail] = useState('')
  const [novoPerfil, setNovoPerfil] = useState<'advogado' | 'estagiario' | 'administrativo'>('advogado')

  const handleConvidar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoEmail) return
    convidarMembro(novoEmail, novoPerfil)
    setNovoEmail('')
  }

  if (user?.perfil !== 'socio') {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Apenas sócios podem gerir a equipa do escritório.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipa</h1>
          <p className="text-muted-foreground">Adicione e gira os utilizadores do seu escritório.</p>
        </div>
        
        <Card className="p-1 bg-slate-900 border-slate-800">
          <CardContent className="p-0 flex items-center">
            <form onSubmit={handleConvidar} className="flex items-center gap-2 p-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Email do colega..." 
                  className="w-64 bg-slate-950 border-slate-800 text-white pl-9"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                />
              </div>
              <select 
                className="bg-slate-950 border-slate-800 text-white text-sm rounded-md px-3 h-10 outline-none focus:ring-1 focus:ring-primary"
                value={novoPerfil}
                onChange={(e) => setNovoPerfil(e.target.value as any)}
              >
                <option value="advogado">Advogado</option>
                <option value="estagiario">Estagiário</option>
                <option value="administrativo">Administrativo</option>
              </select>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros Ativos
            </CardTitle>
            <CardDescription>Pessoas com acesso total ao sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {membros.map((membro) => (
                <div key={membro.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{membro.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {membro.perfil}
                        </Badge>
                        <span className="text-xs text-slate-500">{membro.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {membro.oab && (
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                        OAB: {membro.oab}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Alterar Permissões</DropdownMenuItem>
                        {membro.id !== user?.id && (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => removerMembro(membro.id)}
                          >
                            Remover Acesso
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>A aguardar aceitação.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {convites.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Sem convites pendentes.</p>
                </div>
              ) : (
                convites.map((convite) => (
                  <div key={convite.id} className="p-3 rounded-lg border bg-slate-50 relative group">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 truncate pr-6">{convite.email}</span>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {convite.perfil}
                        </Badge>
                        <button 
                          onClick={() => cancelarConvite(convite.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role explanation */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            role: 'Sócio',
            icon: Shield,
            desc: 'Acesso total, gestão financeira e de equipa.'
          },
          {
            role: 'Advogado',
            icon: Briefcase,
            desc: 'Gestão de processos, prazos e faturas de clientes.'
          },
          {
            role: 'Estagiário',
            icon: UserCircle,
            desc: 'Consulta de processos e execução de tarefas atribuídas.'
          }
        ].map((role, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <role.icon className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-bold">{role.role}</h4>
            </div>
            <p className="text-xs text-slate-400">{role.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
