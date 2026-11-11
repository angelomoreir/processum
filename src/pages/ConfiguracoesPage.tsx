import { useState } from 'react'
import { Settings, Moon, Sun, Bell, Shield, Building, Link2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useConfiguracoesStore } from '../stores/configuracoesStore'
import { useAuthStore } from '../stores/authStore'

export function ConfiguracoesPage() {
  const { 
    tema, setTema, 
    notificacoes, setNotificacao,
    workflow, setWorkflow,
    dadosEscritorio, setDadosEscritorio,
    integracoes, setIntegracao
  } = useConfiguracoesStore()
  const { user } = useAuthStore()
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'notificacoes' | 'workflow' | 'integracoes'>('geral')
  const [dadosEdit, setDadosEdit] = useState(dadosEscritorio)

  const handleSalvarDados = () => {
    setDadosEscritorio(dadosEdit)
    alert('Dados guardados com sucesso!')
  }

  if (user?.perfil !== 'socio') {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Apenas sócios podem aceder às configurações.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Personalização do sistema</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'geral', label: 'Geral', icon: Settings },
          { id: 'notificacoes', label: 'Notificações', icon: Bell },
          { id: 'workflow', label: 'Workflow', icon: Shield },
          { id: 'integracoes', label: 'Integrações', icon: Link2 },
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

      {abaAtiva === 'geral' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados do Escritório
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Escritório</label>
                  <Input
                    value={dadosEdit.nome}
                    onChange={(e) => setDadosEdit({ ...dadosEdit, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIF</label>
                  <Input
                    value={dadosEdit.nif}
                    onChange={(e) => setDadosEdit({ ...dadosEdit, nif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={dadosEdit.email}
                    onChange={(e) => setDadosEdit({ ...dadosEdit, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={dadosEdit.telefone}
                    onChange={(e) => setDadosEdit({ ...dadosEdit, telefone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Morada</label>
                <Input
                  value={dadosEdit.morada}
                  onChange={(e) => setDadosEdit({ ...dadosEdit, morada: e.target.value })}
                />
              </div>
              <Button onClick={handleSalvarDados}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Alterações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tema === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Tema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={tema === t ? 'default' : 'outline'}
                    onClick={() => setTema(t)}
                  >
                    {t === 'light' && <Sun className="mr-2 h-4 w-4" />}
                    {t === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {abaAtiva === 'notificacoes' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferências de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notificacoes).map(([chave, valor]) => (
              <div key={chave} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{chave.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                </div>
                <Button
                  variant={valor ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNotificacao(chave as any, !valor)}
                >
                  {valor ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {abaAtiva === 'workflow' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Workflow e Aprovações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(workflow).map(([chave, valor]) => (
              <div key={chave} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{chave.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                </div>
                <Button
                  variant={valor ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWorkflow(chave as any, !valor)}
                >
                  {valor ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {abaAtiva === 'integracoes' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Integrações Externas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(integracoes).map(([chave, valor]) => (
              <div key={chave} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{chave.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={valor ? 'default' : 'secondary'}>
                    {valor ? 'Conectado' : 'Desconectado'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIntegracao(chave as any, !valor)}
                  >
                    {valor ? 'Desconectar' : 'Conectar'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
