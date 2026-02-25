import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FolderOpen, BookOpen, CalendarDays, Plus, Edit, Trash2, ArrowLeft, Sparkles, } from "lucide-react"

export default function DisciplinaDetalhes() {
  const { disciplinaId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [disciplina, setDisciplina] = useState<any>(null)
  const [projetos, setProjetos] = useState<any[]>([])
  const [professores, setProfessores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // estado do projeto (criar / editar)
  const [projetoEmEdicao, setProjetoEmEdicao] = useState<any | null>(null)

  const [novoProjeto, setNovoProjeto] = useState({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
  })
  const [loadingCriar, setLoadingCriar] = useState(false)

  // helpers de estado / progresso de projeto 
  type StatusProjeto = "pendente" | "em_andamento" | "concluido"

  function calcularStatusProjeto(proj: any): StatusProjeto {
    const hoje = new Date()
    const inicio = new Date(proj.dataInicio)
    const fim = new Date(proj.dataFim)

    if (hoje < inicio) return "pendente"
    if (hoje > fim) return "concluido"
    return "em_andamento"
  }

  function getStatusBadge(status: StatusProjeto) {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
    const styles: Record<StatusProjeto, string> = {
      pendente: "bg-yellow-100 text-yellow-700",
      em_andamento: "bg-blue-100 text-blue-700",
      concluido: "bg-green-100 text-green-700",
    }
    const labels: Record<StatusProjeto, string> = {
      pendente: "Pendente",
      em_andamento: "Em andamento",
      concluido: "Concluído",
    }

    return <span className={`${base} ${styles[status]}`}>{labels[status]}</span>
  }

  function calcularProgresso(proj: any): number {
    const hoje = new Date().getTime()
    const inicio = new Date(proj.dataInicio).getTime()
    const fim = new Date(proj.dataFim).getTime()

    if (!inicio || !fim || fim <= inicio) return 0
    if (hoje <= inicio) return 0
    if (hoje >= fim) return 100

    const perc = ((hoje - inicio) / (fim - inicio)) * 100
    return Math.round(perc)
  }

  //API 
  async function carregarProjetos() {
    const response = await api.get(`/api/disciplinas/${disciplinaId}/projetos`)
    setProjetos(response.data)
  }

  //carregamento inicial
  useEffect(() => {
    if (!disciplinaId) return

    async function fetchData() {
      try {
        setLoading(true)

        // disciplina
        const d = await api.get(`/api/disciplinas/${disciplinaId}`)
        setDisciplina(d.data)

        // projetos
        await carregarProjetos()

        // professores da disciplina (curso)
        const professoresResp = await api.get(
          `/api/cursos/${d.data.cursoId}/professores`,
        )
        setProfessores(professoresResp.data)
      } catch (error) {
        console.error("Erro ao carregar disciplina:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [disciplinaId])

  function abrirModalNovoProjeto() {
    setProjetoEmEdicao(null)
    setNovoProjeto({ nome: "", descricao: "", dataInicio: "", dataFim: "" })
    setShowModal(true)
  }

  function abrirModalEditarProjeto(proj: any) {
    setProjetoEmEdicao(proj)
    setNovoProjeto({
      nome: proj.nome,
      descricao: proj.descricao,
      dataInicio: proj.dataInicio?.slice(0, 10) || "",
      dataFim: proj.dataFim?.slice(0, 10) || "",
    })
    setShowModal(true)
  }

  async function apagarProjeto(id: number) {
    const confirmar = window.confirm("Tem a certeza que pretende eliminar este projeto?")
    if (!confirmar) return

    try {
      await api.delete(`/api/projetos/${id}`)
      await carregarProjetos()
    } catch (error) {
      console.error("Erro ao eliminar projeto", error)
      alert("Erro ao eliminar projeto")
    }
  }

  // criar / editar projeto
  async function criarProjeto(e: React.FormEvent) {
    e.preventDefault()
    setLoadingCriar(true)

    try {
      if (projetoEmEdicao) {
        // editar
        await api.put(`/api/projetos/${projetoEmEdicao.id}`, {
          nome: novoProjeto.nome,
          descricao: novoProjeto.descricao,
          dataInicio: novoProjeto.dataInicio,
          dataFim: novoProjeto.dataFim,
        })
      } else {
        // criar
        await api.post(`/api/disciplinas/${disciplinaId}/projetos`, {
          nome: novoProjeto.nome,
          descricao: novoProjeto.descricao,
          dataInicio: novoProjeto.dataInicio,
          dataFim: novoProjeto.dataFim,
        })
      }

      await carregarProjetos()
      setShowModal(false)
      setNovoProjeto({ nome: "", descricao: "", dataInicio: "", dataFim: "" })
      setProjetoEmEdicao(null)
    } catch (error) {
      console.error("Erro ao guardar projeto", error)
      alert("Erro ao guardar projeto")
    } finally {
      setLoadingCriar(false)
    }
  }

  //loading / erros 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar disciplina...</p>
        </div>
      </div>
    )
  }

  if (!disciplina) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Disciplina não encontrada
          </h2>


        </div>
      </div>
    )
  }

  const isProfessor = user?.papelSistema === "PROFESSOR"

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>

          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                {disciplina.codigo}
              </span>
              <h1 className="text-4xl font-bold mb-2">{disciplina.nome}</h1>
              <p className="text-indigo-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Curso: {disciplina.cursoNome}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <BookOpen className="w-12 h-12 text-white-500" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projetos.length}</p>
                <p className="text-sm text-gray-600">Projetos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
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

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Ativa</p>
                <p className="text-sm text-gray-600">Estado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LAYOUT EM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PROJETOS */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-violet-600" />
                    Projetos da Disciplina
                  </CardTitle>
                  {isProfessor && (
                    <Button onClick={abrirModalNovoProjeto}
                      className="bg-gray-900 hover:bg-gray-800 text-white">
                      <Plus className="w-5 h-5 mr-2 text-white" />
                      Novo Projeto
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {projetos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <FolderOpen className="w-10 h-10 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ainda não existem projetos
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {isProfessor
                        ? "Crie o primeiro projeto para esta disciplina"
                        : "O professor ainda não criou projetos para esta disciplina"}
                    </p>
                    {isProfessor && (
                      <Button onClick={abrirModalNovoProjeto} className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Projeto
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projetos.map((proj) => {
                      const status = calcularStatusProjeto(proj)
                      const progresso = calcularProgresso(proj)

                      return (
                        <div key={proj.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-violet-300 hover:shadow-md transition">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {proj.nome}
                                  </h3>
                                  {getStatusBadge(status)}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {proj.descricao}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>
                                      {new Date(
                                        proj.dataInicio,
                                      ).toLocaleDateString("pt-PT")}{" "}
                                      -{" "}
                                      {new Date(
                                        proj.dataFim,
                                      ).toLocaleDateString("pt-PT")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isProfessor && (
                                <div className="flex gap-2">
                                  <Button size="icon" variant="outline" onClick={() => abrirModalEditarProjeto(proj)} className="h-9 w-9"><Edit className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="outline" onClick={() => apagarProjeto(proj.id)} className="h-9 w-9 hover:bg-red-50 hover:text-red-600 hover:border-red-300"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              )}
                            </div>

                            {/* Barra de Progresso */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progresso</span>
                                <span className="font-semibold">
                                  {progresso}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gray-900 h-2 rounded-full transition-all"
                                  style={{ width: `${progresso}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700" variant="ghost" onClick={() => navigate(`/projetos/${proj.id}/equipas`)}>
                                Ver Equipas
                              </Button>

                              <Button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700" variant="ghost" onClick={() => navigate(`/projetos/${proj.id}/sprints`)}>
                                Ver Sprints
                              </Button>
                              <Button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700" variant="ghost" onClick={() => navigate(`/disciplinas/${disciplina.id}/premios`)}>
                                Ver Prémios
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR - PROFESSORES */}
          <div>
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-5 h-5 text-blue-600" />
                  Professores
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {professores.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Nenhum professor associado
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {professores.map((prof) => (
                      <li key={prof.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                          {prof.nome
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {prof.nome}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {prof.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL CRIAR / EDITAR PROJETO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* HEADER DO MODAL */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-900 to-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {projetoEmEdicao ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {projetoEmEdicao ? "Editar Projeto" : "Novo Projeto"}
              </h2>
            </div>

            {/* form */}
            <div className="p-6">
              <form onSubmit={criarProjeto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    value={novoProjeto.nome}
                    onChange={(e) =>
                      setNovoProjeto({ ...novoProjeto, nome: e.target.value })
                    }
                    placeholder="Ex: Sistema de Gestão"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea value={novoProjeto.descricao} onChange={(e) =>
                    setNovoProjeto({
                      ...novoProjeto,
                      descricao: e.target.value,
                    })
                  }
                    placeholder="Breve descrição do projeto"
                    rows={3}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-400 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início
                    </label>
                    <input type="date" value={novoProjeto.dataInicio} onChange={(e) =>
                      setNovoProjeto({
                        ...novoProjeto,
                        dataInicio: e.target.value,
                      })
                    }
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim
                    </label>
                    <input type="date" value={novoProjeto.dataFim} onChange={(e) =>
                      setNovoProjeto({
                        ...novoProjeto,
                        dataFim: e.target.value,
                      })
                    }
                      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowModal(false)
                    setProjetoEmEdicao(null)
                    setNovoProjeto({
                      nome: "",
                      descricao: "",
                      dataInicio: "",
                      dataFim: "",
                    })
                  }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>

                  <Button type="submit" disabled={loadingCriar} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                    {loadingCriar
                      ? "A guardar..."
                      : projetoEmEdicao
                        ? "Guardar"
                        : "Criar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
