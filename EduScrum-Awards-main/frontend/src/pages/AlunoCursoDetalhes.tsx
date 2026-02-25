import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Users,
  FolderKanban,
  ArrowLeft,
  GraduationCap,
  CalendarDays,
} from "lucide-react"

type Disciplina = {
  id: number
  nome: string
  codigo: string
}

type Curso = {
  id: number
  nome: string
  codigo: string
  adminId: number
  disciplinas: Disciplina[]
}

type Professor = {
  id: number
  nome: string
  email: string
}

type Projeto = {
  id: number
  nome: string
  descricao: string
  dataInicio: string
  dataFim: string
}

export default function AlunoCursoDetalhes() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [curso, setCurso] = useState<Curso | null>(null)
  const [professores, setProfessores] = useState<Professor[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cursoId || !user) return

    async function carregarDados() {
      try {
        setLoading(true)

        // Carregar curso com disciplinas
        const cursoRes = await api.get<Curso>(`/api/cursos/${cursoId}`)
        setCurso(cursoRes.data)

        // Carregar projetos do curso
        const projetosRes = await api.get<Projeto[]>(
          `/api/cursos/${cursoId}/projetos`,
        )
        setProjetos(projetosRes.data)

        // Professores associados ao curso
        const profsRes = await api.get<Professor[]>(
          `/api/cursos/${cursoId}/professores`,
        )
        setProfessores(profsRes.data)
      } catch (err) {
        console.error("Erro ao carregar detalhes do curso:", err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [cursoId, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar curso...</p>
        </div>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Curso não encontrado
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                {curso.codigo}
              </span>
              <h1 className="text-4xl font-bold mb-2">{curso.nome}</h1>
              <p className="text-gray-400">
                Bem-vindo, {user?.nome?.split(" ")[0]}!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <GraduationCap className="w-12 h-12 text-white-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {curso.disciplinas?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Disciplinas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{professores.length}</p>
              <p className="text-sm text-gray-600">Professores</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projetos.length}</p>
              <p className="text-sm text-gray-600">Projetos Ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disciplinas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Disciplinas do Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {curso.disciplinas && curso.disciplinas.length > 0 ? (
              <div className="space-y-3">
                {curso.disciplinas.map((disc) => (
                  <div
                    key={disc.id}
                    className="p-4 border rounded-lg hover:border-violet-300 hover:bg-violet-50 transition cursor-pointer"
                    onClick={() => navigate(`/disciplinas/${disc.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {disc.nome}
                        </h3>
                        <p className="text-sm text-gray-500">{disc.codigo}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Link to={`/disciplinas/${disc.id}`}>
                          Ver disciplina →
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Ainda não existem disciplinas neste curso.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Professores e Projetos */}
        <div className="space-y-6">
          {/* Professores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                Professores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {professores.length > 0 ? (
                <ul className="space-y-3">
                  {professores.map((prof) => (
                    <li key={prof.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        {prof.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{prof.nome}</p>
                        <p className="text-xs text-gray-500">{prof.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum professor atribuído
                </p>
              )}
            </CardContent>
          </Card>

          {/* Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderKanban className="w-4 h-4" />
                Projetos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projetos.length > 0 ? (
                <ul className="space-y-3">
                  {projetos.slice(0, 3).map((proj) => (
                    <li
                      key={proj.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{proj.nome}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(proj.dataInicio).toLocaleDateString("pt-PT")}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" onClick={() => navigate(`/projetos/${proj.id}/equipas`)}>
                        Ver equipa
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Sem projetos ativos
                </p>
              )}

              <Button variant="outline" className="w-full mt-4" onClick={() => {
                // Se houver disciplinas, vai para a primeira
                if (curso?.disciplinas && curso.disciplinas.length > 0) {
                  navigate(`/disciplinas/${curso.disciplinas[0].id}`)
                } else {
                  alert("Este curso ainda não tem disciplinas com projetos.")
                }
              }}>
                Ver todos os projetos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}