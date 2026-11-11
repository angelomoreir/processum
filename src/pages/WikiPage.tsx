import { useState } from 'react'
import { Search, Plus, FileText, HelpCircle, Eye, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useWikiStore } from '../stores/wikiStore'
import { useAuthStore } from '../stores/authStore'

const CATEGORIAS = ['Procedimentos', 'Templates', 'Legislação', 'FAQ']

export function WikiPage() {
  const { artigos, faqs, pesquisar, getArtigosPopulares, incrementarViews, votarFAQ } = useWikiStore()
  const { user } = useAuthStore()
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')
  const [artigoSelecionado, setArtigoSelecionado] = useState<string | null>(null)

  const resultadosPesquisa = termoPesquisa ? pesquisar(termoPesquisa) : null
  const artigosFiltrados = categoriaAtiva === 'Todas' 
    ? artigos 
    : artigos.filter((a) => a.categoria === categoriaAtiva)
  const artigosPopulares = getArtigosPopulares(5)

  const artigoAtual = artigoSelecionado ? artigos.find((a) => a.id === artigoSelecionado) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
          <p className="text-muted-foreground">Wiki, templates e FAQ do escritório</p>
        </div>
        {user?.perfil === 'socio' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Artigo
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Pesquisar na wiki..."
          value={termoPesquisa}
          onChange={(e) => setTermoPesquisa(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {resultadosPesquisa && (
        <div className="space-y-4">
          <h3 className="font-semibold">Resultados da pesquisa:</h3>
          {resultadosPesquisa.artigos.length === 0 && resultadosPesquisa.faqs.length === 0 ? (
            <p className="text-muted-foreground">Nenhum resultado encontrado</p>
          ) : (
            <>
              {resultadosPesquisa.artigos.map((artigo) => (
                <Card key={artigo.id} className="cursor-pointer" onClick={() => { setArtigoSelecionado(artigo.id); incrementarViews(artigo.id) }}>
                  <CardContent className="p-4">
                    <p className="font-medium">{artigo.titulo}</p>
                    <p className="text-sm text-muted-foreground">{artigo.categoria}</p>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {!resultadosPesquisa && !artigoSelecionado && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 flex-wrap">
              {['Todas', ...CATEGORIAS].map((cat) => (
                <Button
                  key={cat}
                  variant={categoriaAtiva === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaAtiva(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {artigosFiltrados.map((artigo) => (
                <Card key={artigo.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setArtigoSelecionado(artigo.id); incrementarViews(artigo.id) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{artigo.titulo}</p>
                          <p className="text-sm text-muted-foreground">{artigo.autor_nome} • {new Date(artigo.created_at).toLocaleDateString('pt-PT')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {artigo.views}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {artigo.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mais Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {artigosPopulares.map((artigo, idx) => (
                  <div key={artigo.id} className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setArtigoSelecionado(artigo.id)}>
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span className="flex-1 truncate">{artigo.titulo}</span>
                    <span className="text-muted-foreground text-xs">{artigo.views} views</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.slice(0, 3).map((faq) => (
                  <div key={faq.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium text-sm">{faq.pergunta}</p>
                    <p className="text-sm text-muted-foreground mt-1">{faq.resposta.substring(0, 100)}...</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => votarFAQ(faq.id, true)}>
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {faq.util}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => votarFAQ(faq.id, false)}>
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {faq.nao_util}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {artigoAtual && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{artigoAtual.titulo}</CardTitle>
                <p className="text-sm text-muted-foreground">{artigoAtual.categoria} • {artigoAtual.autor_nome}</p>
              </div>
              <Button variant="ghost" onClick={() => setArtigoSelecionado(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-wrap">{artigoAtual.conteudo}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
