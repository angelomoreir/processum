import { useState } from 'react'
import { Scale, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

import { Link } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    if (!success) {
      setError('Email ou palavra-passe incorretos')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />

      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-sm text-white">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Processum</CardTitle>
          <CardDescription className="text-slate-400">
            Aceda ao seu escritório digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@escritorio.pt"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Palavra-passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11" disabled={loading}>
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Novo por aqui?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/register">
              <Button variant="outline" className="w-full border-slate-800 text-slate-300 hover:bg-slate-800">
                Criar nova conta de escritório
              </Button>
            </Link>
          </div>

          <div className="mt-8 rounded-lg bg-slate-950/50 border border-slate-800 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-400 mb-2">Credenciais de demonstração:</p>
            <ul className="space-y-1.5">
              <li><span className="text-slate-400">Sócio:</span> socio@escritorio.pt / 123456</li>
              <li><span className="text-slate-400">Advogado:</span> advogado@escritorio.pt / 123456</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
