import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, ArrowRight, GraduationCap, FolderKanban, Settings } from "lucide-react"

type Curso = {
  id: number
  nome: string
  codigo: string
  adminId: number
  disciplinas?: Array<{ id: number; nome: string; codigo: string }>
}

export default function ProfessorCursos() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [totalProjetos, setTotalProjetos] = useState(0) // Estado para o contador
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return setLoading(false)

    async function carregarCursos() {
      try {
        setLoading(true)

        //Buscar Cursos
        const res = await api.get(`/api/professores/${user?.id}/cursos`)

        const listaCursos = Array.isArray(res.data) ? res.data : []
        setCursos(listaCursos)

        //Calcular Total de Projetos
        const todasDisciplinas = listaCursos.flatMap((c: Curso) =>
          Array.isArray(c.disciplinas) ? c.disciplinas : []
        )

        // Busca projetos de cada disciplina em paralelo
        const contagens = await Promise.all(
          todasDisciplinas.map(async (disc) => {
            try {
              const resProj = await api.get(`/api/disciplinas/${disc.id}/projetos`)
              // Proteção: Verifica se a resposta é um array antes de ler o length
              return Array.isArray(resProj.data) ? resProj.data.length : 0
            } catch (e) {
              console.warn(`Não foi possível carregar projetos da disciplina ${disc.id}`)
              return 0
            }
          })
        )

        // Soma o total
        const total = contagens.reduce((acc, val) => acc + val, 0)
        setTotalProjetos(total)

      } catch (err) {
        console.error("Erro ao carregar cursos do professor:", err)
      } finally {
        setLoading(false)
      }
    }

    carregarCursos()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar os seus cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-400">Área do Professor</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">
                Olá, Prof. {user?.nome?.split(" ")[0]}!
              </h1>
              <p className="text-gray-400 text-lg">
                {cursos.length === 0
                  ? "Ainda não leciona nenhum curso"
                  : `A lecionar ${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'}`
                }
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <GraduationCap className="w-12 h-12 text-white-500" />
            </div>
          </div>
        </div>

        {/* Estado Vazio */}
        {cursos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Ainda não leciona nenhum curso
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Contacte o administrador ou aguarde a atribuição dos seus cursos.
              Assim que for associado a um curso, ele aparecerá aqui.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-sm">
              <Users className="w-4 h-4" />
              Em breve terá acesso aos seus cursos
            </div>
          </div>
        )}

        {/* Grid de Cursos */}
        {cursos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map((curso) => (
              <Card
                key={curso.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden relative"
              >
                <CardContent className="p-6">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-violet-600" />
                    </div>
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                      {curso.codigo}
                    </span>
                  </div>

                  {/* Nome do Curso */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                    {curso.nome}
                  </h3>

                  {/* Stats do Curso */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 text-violet-500" />
                      <span>{curso.disciplinas?.length || 0} disciplinas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Alunos matriculados</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FolderKanban className="w-4 h-4 text-green-500" />
                      <span>Projetos ativos</span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate(`/professor/cursos/${curso.id}`)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white group-hover:shadow-lg transition-all"
                    >
                      Gerir Curso
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button variant="outline" onClick={() => navigate(`/professor/cursos/${curso.id}`)} className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </div>
                </CardContent>

                {/* Decoração do Card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats (se houver cursos) */}
        {cursos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{cursos.length}</p>
                  <p className="text-sm text-gray-600">
                    {cursos.length === 1 ? 'Curso a lecionar' : 'Cursos a lecionar'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {cursos.reduce((acc, c) => acc + (c.disciplinas?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total de disciplinas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalProjetos}</p>
                  <p className="text-sm text-gray-600">Projetos em curso</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}