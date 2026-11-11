import { Link } from 'react-router-dom'
import { 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Sparkles,
  MessageSquare,
} from 'lucide-react'
import { Button } from '../components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Processum</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Preços</a>
            <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sobre</a>
            <Link to="/portal" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors border-l border-slate-800 pl-6">Portal do Cliente</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 shadow-lg shadow-primary/20">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-primary mb-8 animate-fade-in">
              <Sparkles className="h-3 w-3" />
              <span>Novo: Assistente Jurídico com IA</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              A Nova Era da Gestão <br className="hidden lg:block" />
              Jurídica Inteligente.
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed">
              Centralize processos, clientes e documentos numa plataforma única desenhada para escritórios de alta performance. Ganhe tempo com automação e IA.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-lg shadow-xl shadow-primary/30">
                  Experimentar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-slate-800 text-slate-300 hover:bg-slate-900 h-12 px-8 text-lg">
                Ver Demonstração
              </Button>
            </div>

            {/* Dashboard Mockup Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
                <div className="aspect-[16/9] bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800/50">
                  {/* Simplified Mockup Placeholder */}
                  <div className="w-full h-full p-8 flex flex-col gap-6 opacity-40">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
                      <div className="flex gap-4">
                        <div className="h-8 w-8 bg-slate-800 rounded-full" />
                        <div className="h-8 w-8 bg-slate-800 rounded-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="h-32 bg-slate-800 rounded" />
                      <div className="h-32 bg-slate-800 rounded" />
                      <div className="h-32 bg-slate-800 rounded" />
                    </div>
                    <div className="h-64 bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tudo o que o seu escritório precisa</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Funcionalidades avançadas integradas num ecossistema fluido para maximizar a sua faturação e produtividade.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Gestão de Processos',
                  desc: 'Acompanhamento total de prazos e diligências com automatismos inteligentes.'
                },
                {
                  icon: MessageSquare,
                  title: 'Portal do Cliente',
                  desc: 'Área exclusiva para os seus clientes consultarem estados e documentos de forma segura.'
                },
                {
                  icon: Shield,
                  title: 'Segurança de Dados',
                  desc: 'Encriptação de nível bancário e conformidade total com o RGPD.'
                },
                {
                  icon: Sparkles,
                  title: 'IA Jurídica',
                  desc: 'Análise preditiva e assistente de redação para acelerar o seu fluxo de trabalho.'
                },
                {
                  icon: BarChart3,
                  title: 'Analytics Avançado',
                  desc: 'Dashboards financeiros e de performance para decisões baseadas em dados.'
                },
                {
                  icon: Users,
                  title: 'Colaboração Real',
                  desc: 'Gestão de equipa com atribuição de tarefas e controle de tempos faturáveis.'
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Planos simples e transparentes</h2>
              <p className="text-slate-400">Escolha o plano ideal para a escala do seu escritório.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Bronze',
                  price: '49€',
                  desc: 'Ideal para advogados individuais.',
                  features: ['Até 50 processos ativos', 'Portal do cliente básico', '1GB de armazenamento', 'Suporte via email']
                },
                {
                  name: 'Professional',
                  price: '99€',
                  desc: 'Para pequenos escritórios em crescimento.',
                  features: ['Até 500 processos ativos', 'Portal do cliente completo', 'Assistente AI (Beta)', '10GB de armazenamento', 'Suporte prioritário'],
                  popular: true
                },
                {
                  name: 'Enterprise',
                  price: 'Sob consulta',
                  desc: 'Solução sob medida para grandes firmas.',
                  features: ['Processos ilimitados', 'IA Jurídica completa', 'API de integração', 'Armazenamento ilimitado', 'Account Manager dedicado']
                }
              ].map((plan, i) => (
                <div key={i} className={cn(
                  "p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                  plan.popular ? "bg-slate-900 border-primary shadow-2xl shadow-primary/10" : "bg-slate-950 border-slate-800"
                )}>
                  {plan.popular && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
                      Mais Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Sob consulta' && <span className="text-slate-500 ml-1">/mês</span>}
                  </div>
                  <p className="text-slate-400 text-sm mb-8">{plan.desc}</p>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/register">
                    <Button className={cn(
                      "w-full h-11",
                      plan.popular ? "bg-primary hover:bg-primary/90" : "bg-slate-800 hover:bg-slate-700"
                    )}>
                      Começar Plano
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-30" />
                <div className="relative aspect-square rounded-3xl bg-slate-900 border border-slate-800 p-8 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 opacity-50">
                    <div className="w-24 h-24 bg-primary/20 rounded-2xl animate-pulse" />
                    <div className="w-24 h-24 bg-slate-800 rounded-2xl" />
                    <div className="w-24 h-24 bg-slate-800 rounded-2xl" />
                    <div className="w-24 h-24 bg-primary/10 rounded-2xl animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scale className="h-32 w-32 text-primary/40" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Desenvolvido por Advogados para Advogados</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  O Processum nasceu da necessidade real de modernização do setor jurídico em Portugal. A nossa missão é simplificar a complexidade burocrática através de tecnologia de ponta.
                </p>
                <div className="space-y-4">
                  {[
                    'Presença em mais de 500 escritórios',
                    'Equipa de suporte 100% portuguesa',
                    'Inovação constante com base no feedback dos clientes'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-slate-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8">Pronto para modernizar o seu escritório?</h2>
            <p className="text-slate-400 text-lg mb-10">Junte-se a centenas de advogados que já transformaram a sua produtividade com o Processum.</p>
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-xl">
                Criar Conta Gratuita
              </Button>
            </Link>
            <p className="mt-4 text-slate-500 text-sm italic">Não é necessário cartão de crédito.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Processum</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Líder em software jurídico SaaS para o mercado português. Tecnologia que liberta o seu talento jurídico.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Plataforma</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
              <li><Link to="/portal" className="hover:text-primary transition-colors">Portal do Cliente</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Centro de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Webinars</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} Processum Technologies. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
