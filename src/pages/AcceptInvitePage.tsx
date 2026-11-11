import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Scale, User, Lock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { api, setToken } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import type { Usuario } from '../types'

interface ConviteInfo {
  email: string
  perfil: string
  status: string
}

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [invite, setInvite] = useState<ConviteInfo | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setInviteError('Link de convite inválido')
      return
    }
    api
      .get<ConviteInfo>(`/convites/info/${token}`)
      .then((info) => {
        if (info.status !== 'pendente') setInviteError('Este convite já foi utilizado')
        else setInvite(info)
      })
      .catch(() => setInviteError('Convite não encontrado ou expirado'))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('As palavras-passe não coincidem')
      return
    }

    setLoading(true)
    try {
      const res = await api.post<{ token: string; user: Usuario }>('/auth/accept-invite', {
        token,
        nome: formData.nome,
        password: formData.password,
      })
      setToken(res.token)
      useAuthStore.setState({ user: res.user })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar conta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white text-center p-8">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Bem-vindo à Equipa!</CardTitle>
          <p className="text-slate-400 mb-8">A sua conta foi criada com sucesso.</p>
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={() => navigate('/dashboard')}
          >
            Entrar no Escritório
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Scale className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-white tracking-tight">Processum</span>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Aceitar Convite</CardTitle>
            <CardDescription className="text-slate-400">
              {invite
                ? <>Foi convidado para se juntar ao escritório como <span className="text-primary font-semibold">{invite.perfil}</span>.</>
                : 'A validar o seu convite...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteError ? (
              <div className="text-center space-y-4">
                <p className="text-red-400 text-sm">{inviteError}</p>
                <Link to="/login">
                  <Button variant="outline" className="border-slate-700 text-slate-300">
                    Ir para o Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Seu Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Dr. Nome Sobrenome"
                      className="bg-slate-950 border-slate-800 text-white pl-10"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <Input
                    value={invite?.email || ''}
                    disabled
                    className="bg-slate-900/50 border-slate-800 text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Definir Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-950 border-slate-800 text-white pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirmar Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-950 border-slate-800 text-white pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11 mt-4" disabled={loading || !invite}>
                  {loading ? 'A processar...' : 'Ativar Conta e Entrar'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
