import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  LogOut,
  Scale,
  Bell,
  Search,
  Menu,
  DollarSign,
  Kanban,
  Sparkles,
  BarChart3,
  History,
  Send,
  FileSignature,
  ExternalLink,
  Plug,
  Trophy,
  BookOpen,
  Clock,
  MessageSquare,
  Mic,
  Brain,
  Settings,
  Megaphone,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { usePrazosStore } from '../stores/prazosStore'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

const navGroups = [
  {
    title: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/clientes', icon: Users, label: 'Clientes' },
      { to: '/processos', icon: Briefcase, label: 'Processos' },
      { to: '/calendario', icon: Calendar, label: 'Calendário' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
      { to: '/tarefas', icon: Kanban, label: 'Tarefas' },
      { to: '/orcamentos', icon: FileText, label: 'Orçamentos' },
      { to: '/conflitos', icon: AlertTriangle, label: 'Conflitos' },
      { to: '/equipa', icon: Users, label: 'Equipa' },
      { to: '/departamentos', icon: Briefcase, label: 'Departamentos' },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { to: '/ai', icon: Sparkles, label: 'Assistente AI' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/analise-preditiva', icon: Brain, label: 'Análise Preditiva' },
    ],
  },
  {
    title: 'Operacional',
    items: [
      { to: '/documentos', icon: FileText, label: 'Documentos' },
      { to: '/audiencias', icon: Mic, label: 'Audiências' },
      { to: '/assinatura', icon: FileSignature, label: 'Assinatura' },
      { to: '/timer', icon: Clock, label: 'Timer' },
      { to: '/wiki', icon: BookOpen, label: 'Wiki' },
      { to: '/auditoria', icon: History, label: 'Auditoria' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
      { to: '/comunicacoes', icon: Send, label: 'Comunicações' },
      { to: '/chat', icon: MessageSquare, label: 'Chat' },
      { to: '/integracoes', icon: Plug, label: 'Integrações' },
      { to: '/gamificacao', icon: Trophy, label: 'Gamificação' },
      { to: '/marketing', icon: Megaphone, label: 'Marketing' },
      { to: '/lgpd', icon: Shield, label: 'LGPD' },
    ],
  },
]

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const { getPrazosUrgentes } = usePrazosStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const [busca, setBusca] = useState('')

  const prazosUrgentes = getPrazosUrgentes()
  const numNotificacoes = prazosUrgentes.length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            sidebarCollapsed ? 'lg:w-20' : 'lg:w-64 w-64'
          )}
        >
          <div className="flex h-16 items-center px-4 border-b border-slate-800">
            <Scale className={cn("h-8 w-8 text-primary transition-all", sidebarCollapsed && "mx-auto")} />
            {!sidebarCollapsed && (
              <span className="ml-3 text-xl font-bold tracking-tight">Processum</span>
            )}
          </div>

          <nav className="flex-1 space-y-4 px-3 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                          sidebarCollapsed && "justify-center px-0"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !sidebarCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
                          )}
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "group-hover:text-white",
                            !sidebarCollapsed && "mr-3"
                          )} />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                          {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                              {item.label}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
                {!sidebarCollapsed && group.title !== navGroups[navGroups.length - 1].title && (
                  <div className="h-px bg-slate-800/50 my-4 mx-3" />
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800 p-4">
            <NavLink
              to="/portal"
              target="_blank"
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <ExternalLink className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
              {!sidebarCollapsed && <span>Portal do Cliente</span>}
            </NavLink>

            <div className={cn("mt-4 flex items-center px-2", sidebarCollapsed && "justify-center px-0")}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-primary">
                {user?.nome.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-white">{user?.nome}</p>
                  <p className="truncate text-xs text-slate-500 capitalize">{user?.perfil}</p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              className={cn(
                "mt-4 w-full justify-start text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors",
                sidebarCollapsed && "justify-center px-0"
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
              {!sidebarCollapsed && <span>Sair</span>}
            </Button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="mt-4 hidden lg:flex w-full items-center justify-center rounded-lg border border-slate-800 py-2 text-slate-500 hover:bg-slate-800 hover:text-white transition-all"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <div className="flex items-center text-xs font-medium uppercase tracking-wider">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Recolher
                </div>
              )}
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="relative ml-4 hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar processos, clientes..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && busca.trim()) {
                      navigate(`/processos?search=${encodeURIComponent(busca)}`)
                      setBusca('')
                    }
                  }}
                  className="h-10 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
              >
                <Bell className="h-5 w-5" />
                {numNotificacoes > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {numNotificacoes > 9 ? '9+' : numNotificacoes}
                  </span>
                )}
              </Button>
              
              {notificacoesAbertas && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50 p-4">
                  <h3 className="font-semibold mb-3">Prazos Urgentes</h3>
                  {prazosUrgentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum prazo urgente</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {prazosUrgentes.slice(0, 5).map((prazo) => (
                        <Link
                          key={prazo.id}
                          to={`/processos/${prazo.processo_id}`}
                          onClick={() => setNotificacoesAbertas(false)}
                          className="block p-2 rounded hover:bg-muted text-sm"
                        >
                          <p className="font-medium">{prazo.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {prazo.processo?.numero} • Vence em: {new Date(prazo.data_fim).toLocaleDateString('pt-PT')}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => {
                      setNotificacoesAbertas(false)
                      navigate('/calendario')
                    }}
                  >
                    Ver todos os prazos
                  </Button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
