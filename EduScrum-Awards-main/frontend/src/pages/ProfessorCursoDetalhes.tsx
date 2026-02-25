import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, ArrowLeft, GraduationCap, Plus, Trash2, Download, FileSpreadsheet } from "lucide-react"

//Tipos para os dados da API
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

type Aluno = {
  id: number
  nome: string
  email: string
}

export default function ProfessorCursoDetalhes() {
  const { cursoId } = useParams<{ cursoId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [curso, setCurso] = useState<Curso | null>(null)
  const [professores, setProfessores] = useState<Professor[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false) // Estado para o botão de exportar

  // Modais
  const [showDisciplinaModal, setShowDisciplinaModal] = useState(false)
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: "", codigo: "" })

  useEffect(() => {
    if (!cursoId || !user) return

    async function carregarDados() {
      try {
        setLoading(true)

        const cursoRes = await api.get<Curso>(`/api/cursos/${cursoId}`)
        setCurso(cursoRes.data)

        const profsRes = await api.get<Professor[]>(`/api/cursos/${cursoId}/professores`)
        setProfessores(profsRes.data)

        const alunosRes = await api.get<Aluno[]>(`/api/cursos/${cursoId}/alunos`)
        setAlunos(alunosRes.data)

      } catch (err) {
        console.error("Erro ao carregar detalhes do curso:", err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [cursoId, user])

  // Criar disciplina
  const handleCriarDisciplina = async () => {
    try {
      await api.post(`/api/cursos/${cursoId}/disciplinas`, novaDisciplina)

      const cursoRes = await api.get<Curso>(`/api/cursos/${cursoId}`)
      setCurso(cursoRes.data)

      setShowDisciplinaModal(false)
      setNovaDisciplina({ nome: "", codigo: "" })
    } catch (err) {
      console.error("Erro ao criar disciplina:", err)
      alert("Erro ao criar disciplina")
    }
  }

  // Eliminar disciplina
  const handleEliminarDisciplina = async (disciplinaId: number) => {
    if (!confirm("Tem certeza que deseja eliminar esta disciplina?")) return

    try {
      await api.delete(`/api/cursos/${cursoId}/disciplinas/${disciplinaId}`)

      const cursoRes = await api.get<Curso>(`/api/cursos/${cursoId}`)
      setCurso(cursoRes.data)
    } catch (err) {
      console.error("Erro ao eliminar disciplina:", err)
      alert("Erro ao eliminar disciplina")
    }
  }

  // --- NOVA FUNÇÃO: EXPORTAR CSV ---
  const handleExportarCsv = async () => {
    if (!cursoId) return
    try {
      setDownloading(true)

      // Pedir o ficheiro ao backend como "blob" (dados binários)
      const response = await api.get(`/api/professores/cursos/${cursoId}/exportar`, {
        responseType: 'blob'
      })

      // Criar um link temporário para forçar o download no browser
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      // Nome do ficheiro sugerido
      link.setAttribute('download', `Pauta_Curso_${curso?.codigo || cursoId}.csv`)
      document.body.appendChild(link)
      link.click()

      // Limpeza
      link.remove()
      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error("Erro ao exportar CSV:", err)
      alert("Erro ao descarregar a pauta.")
    } finally {
      setDownloading(false)
    }
  }

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Curso não encontrado</h2>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">

          <div className="flex justify-between items-start mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>

            {/* --- NOVO BOTÃO: EXPORTAR --- */}
            <Button
              onClick={handleExportarCsv}
              disabled={downloading}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              {downloading ? (
                "A gerar..."
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-400" />
                  Exportar Pauta
                </>
              )}
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                {curso.codigo}
              </span>
              <h1 className="text-4xl font-bold mb-2">{curso.nome}</h1>
              <p className="text-indigo-100">Gestão de disciplinas e alunos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <GraduationCap className="w-12 h-12 text-white-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{curso.disciplinas?.length || 0}</p>
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
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alunos.length}</p>
              <p className="text-sm text-gray-600">Alunos</p>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Disciplinas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Disciplinas do Curso
              </CardTitle>
              <Button
                onClick={() => setShowDisciplinaModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2 text-white" />
                Nova Disciplina
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {curso.disciplinas?.length ? (
              <div className="space-y-3">
                {curso.disciplinas.map((disc) => (
                  <div key={disc.id} className="p-4 border rounded-lg hover:border-violet-300 hover:bg-violet-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{disc.nome}</h3>
                        <p className="text-sm text-gray-500">{disc.codigo}</p>
                      </div>

                      <div className="flex gap-2">
                        {/* Ir para os detalhes da disciplina  */}
                        <Button size="sm" variant="outline" onClick={() => navigate(`/disciplinas/${disc.id}`)}>
                          Ver disciplina
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => handleEliminarDisciplina(disc.id)} className="hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

        {/* Professores + Alunos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Professores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Professores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {professores.length ? (
                <ul className="space-y-3">
                  {professores.map((prof) => (
                    <li key={prof.id} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {prof.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{prof.nome}</p>
                        <p className="text-sm text-gray-500">{prof.email}</p>
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

          {/* Alunos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alunos.length ? (
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                  {alunos.map((aluno) => (
                    <li key={aluno.id} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{aluno.nome}</p>
                        <p className="text-sm text-gray-500">{aluno.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum aluno matriculado
                </p>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Modal Criar Disciplina */}
      {showDisciplinaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">

            {/* HEADER DO MODAL */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-slate-800 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Disciplina
              </h2>
            </div>

            <div className="p-6 bg-white">

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  value={novaDisciplina.nome}
                  onChange={(e) =>
                    setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })
                  }
                  placeholder="Ex: Programação Web"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-gray-500 focus:outline-none bg-white text-gray-900"
                />
              </div>

              {/* Código */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código
                </label>
                <input
                  type="text"
                  value={novaDisciplina.codigo}
                  onChange={(e) =>
                    setNovaDisciplina({ ...novaDisciplina, codigo: e.target.value })
                  }
                  placeholder="Ex: PW2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-gray-500 focus:outline-none bg-white text-gray-900"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-6">
                <Button
                  onClick={() => {
                    setShowDisciplinaModal(false)
                    setNovaDisciplina({ nome: "", codigo: "" })
                  }}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </Button>

                <Button
                  onClick={handleCriarDisciplina}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={!novaDisciplina.nome || !novaDisciplina.codigo}
                >
                  Criar
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}