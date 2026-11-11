import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { syncAll } from './lib/sync'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ClientesPage } from './pages/ClientesPage'
import { ProcessosPage } from './pages/ProcessosPage'
import { ProcessoDetailPage } from './pages/ProcessoDetailPage'
import { CalendarioPage } from './pages/CalendarioPage'
import { DocumentosPage } from './pages/DocumentosPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { KanbanPage } from './pages/KanbanPage'
import { AIToolsPage } from './pages/AIToolsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AuditoriaPage } from './pages/AuditoriaPage'
import { ComunicacoesPage } from './pages/ComunicacoesPage'
import { AssinaturaPage } from './pages/AssinaturaPage'
import { IntegracoesPage } from './pages/IntegracoesPage'
import { GamificacaoPage } from './pages/GamificacaoPage'
import { AgendamentoPage } from './pages/AgendamentoPage'
import { TrustAccountingPage } from './pages/TrustAccountingPage'
import { OrcamentosPage } from './pages/OrcamentosPage'
import { ConflitosPage } from './pages/ConflitosPage'
import { WikiPage } from './pages/WikiPage'
import { TimerPage } from './pages/TimerPage'
import { ChatPage } from './pages/ChatPage'
import { AnalisePreditivaPage } from './pages/AnalisePreditivaPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { MarketingCRMPage } from './pages/MarketingCRMPage'
import { LGPDPage } from './pages/LGPDPage'
import { LandingPage } from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { PortalClienteLogin } from './pages/PortalClienteLogin'
import { EquipaPage } from './pages/EquipaPage'
import { AcceptInvitePage } from './pages/AcceptInvitePage'
import { AudienciasPage } from './pages/AudienciasPage'
import { DepartamentosPage } from './pages/DepartamentosPage'

function App() {
  const { user, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (user) {
      syncAll()
      const interval = setInterval(syncAll, 60_000)
      const onFocus = () => syncAll()
      window.addEventListener('focus', onFocus)
      return () => {
        clearInterval(interval)
        window.removeEventListener('focus', onFocus)
      }
    }
  }, [user])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/portal" element={<PortalClienteLogin />} />
      <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/processos" element={<ProcessosPage />} />
                <Route path="/processos/:id" element={<ProcessoDetailPage />} />
                <Route path="/calendario" element={<CalendarioPage />} />
                <Route path="/documentos" element={<DocumentosPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/tarefas" element={<KanbanPage />} />
                <Route path="/ai" element={<AIToolsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/auditoria" element={<AuditoriaPage />} />
                <Route path="/comunicacoes" element={<ComunicacoesPage />} />
                <Route path="/assinatura" element={<AssinaturaPage />} />
                <Route path="/integracoes" element={<IntegracoesPage />} />
                <Route path="/gamificacao" element={<GamificacaoPage />} />
                <Route path="/agendamento" element={<AgendamentoPage />} />
                <Route path="/trust" element={<TrustAccountingPage />} />
                <Route path="/orcamentos" element={<OrcamentosPage />} />
                <Route path="/conflitos" element={<ConflitosPage />} />
                <Route path="/wiki" element={<WikiPage />} />
                <Route path="/timer" element={<TimerPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/analise-preditiva" element={<AnalisePreditivaPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/marketing" element={<MarketingCRMPage />} />
                <Route path="/lgpd" element={<LGPDPage />} />
                <Route path="/equipa" element={<EquipaPage />} />
                <Route path="/audiencias" element={<AudienciasPage />} />
                <Route path="/departamentos" element={<DepartamentosPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
