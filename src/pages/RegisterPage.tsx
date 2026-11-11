import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Lock, Mail, User, Briefcase, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuthStore } from '../stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [formData, setFormData] = useState({
    firmName: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      return setError('As palavras-passe não coincidem')
    }

    setLoading(true)

    const res = await register({
      email: formData.email,
      nome: formData.adminName,
      password: formData.password,
      firmName: formData.firmName,
    })
    setLoading(false)

    if (res.ok) {
      navigate('/dashboard')
    } else {
      setError(res.erro || 'Erro ao criar conta')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Voltar à página inicial</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Scale className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-white tracking-tight">Processum</span>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm text-white">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Criar nova conta</CardTitle>
            <CardDescription className="text-slate-400">
              Comece hoje o seu período experimental de 14 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firmName" className="text-sm font-medium text-slate-300">Nome do Escritório</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      id="firmName"
                      placeholder="Ex: Silva & Associados"
                      className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-primary"
                      value={formData.firmName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="adminName" className="text-sm font-medium text-slate-300">Seu Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      id="adminName"
                      placeholder="Dr. João Silva"
                      className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-primary"
                      value={formData.adminName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="joao@escritorio.pt"
                    className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-primary"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-primary"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">Confirmar</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-primary"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11 mt-2" disabled={loading}>
                {loading ? 'A criar conta...' : 'Criar Conta e Começar'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500">Já tem uma conta?</span>
                </div>
              </div>

              <Link to="/login">
                <Button variant="outline" className="w-full border-slate-800 text-slate-300 hover:bg-slate-800">
                  Entrar no Escritório
                </Button>
              </Link>

              <p className="text-[10px] text-center text-slate-500 mt-4 px-4">
                Ao clicar em "Criar Conta", você concorda com os nossos <a href="#" className="underline hover:text-primary">Termos de Uso</a> e <a href="#" className="underline hover:text-primary">Política de Privacidade</a>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
