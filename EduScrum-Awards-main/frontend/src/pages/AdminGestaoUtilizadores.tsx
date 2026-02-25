import { useEffect, useState } from "react"
import api from "@/lib/api"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Users, GraduationCap, BookOpen, Search, UserCheck, UserX, AlertCircle } from "lucide-react"

type Papel = "ALUNO" | "PROFESSOR" | "ADMIN"

type Utilizador = {
  id: number
  nome: string
  email: string
  papelSistema: Papel
}

type Curso = {
  id: number
  nome: string
  codigo: string
  adminId?: number
}

type CursosPorUserMap = Record<number, Curso | null>

export default function AdminGestaoUtilizadoresRedesign() {

  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cursosPorUser, setCursosPorUser] = useState<CursosPorUserMap>({})
  const [loading, setLoading] = useState(true)
  const [loadingAcao, setLoadingAcao] = useState<number | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoPapelFiltro, setTipoPapelFiltro] = useState<"TODOS" | Papel>("TODOS")
  const [statusCursoFiltro, setStatusCursoFiltro] = useState<"TODOS" | "COM_CURSO" | "SEM_CURSO">("TODOS")

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [userSelecionado, setUserSelecionado] = useState<Utilizador | null>(null)
  const [cursoSelecionadoId, setCursoSelecionadoId] = useState<number | "">("")

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)

      // Buscar utilizadores e cursos reais
      const [usersRes, cursosRes] = await Promise.all([
        api.get<Utilizador[]>("/api/utilizadores"),
        api.get<Curso[]>("/api/cursos")
      ])

      setUtilizadores(usersRes.data)
      setCursos(cursosRes.data)

      // Filtrar apenas alunos e professores para buscar cursos
      const apenasAlunosProf = usersRes.data.filter(
        u => u.papelSistema === "ALUNO" || u.papelSistema === "PROFESSOR"
      )

      // Buscar curso atribuído a cada utilizador
      const associacoes = await Promise.all(
        apenasAlunosProf.map(async (u) => {
          try {
            const base = u.papelSistema === "ALUNO" ? "/api/alunos" : "/api/professores"
            const res = await api.get<Curso[]>(`${base}/${u.id}/cursos`)
            const curso = res.data[0] ?? null
            return [u.id, curso] as const
          } catch (err) {
            console.error("Erro a carregar curso do utilizador:", u.id, err)
            return [u.id, null] as const
          }
        })
      )

      // Guardar os cursos associados
      const map: CursosPorUserMap = {}
      associacoes.forEach(([id, curso]) => {
        map[id] = curso
      })
      setCursosPorUser(map)

    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }

  // Aplica filtros
  const utilizadoresFiltrados = utilizadores.filter(user => {
    const searchMatch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const papelMatch =
      tipoPapelFiltro === "TODOS" || user.papelSistema === tipoPapelFiltro

    const temCurso = !!cursosPorUser[user.id]
    const cursoMatch =
      statusCursoFiltro === "TODOS" ||
      (statusCursoFiltro === "COM_CURSO" && temCurso) ||
      (statusCursoFiltro === "SEM_CURSO" && !temCurso)

    return searchMatch && papelMatch && cursoMatch
  })

  const alunos = utilizadoresFiltrados.filter(u => u.papelSistema === "ALUNO")
  const professores = utilizadoresFiltrados.filter(u => u.papelSistema === "PROFESSOR")

  // Modal
  const abrirModal = (user: Utilizador) => {
    setUserSelecionado(user)
    const atual = cursosPorUser[user.id]
    setCursoSelecionadoId(atual ? atual.id : "")
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setUserSelecionado(null)
    setCursoSelecionadoId("")
  }

  // Atribuir curso
  const confirmarAtribuicao = async () => {
    if (!userSelecionado || !cursoSelecionadoId) return

    try {
      setLoadingAcao(userSelecionado.id)

      const base =
        userSelecionado.papelSistema === "ALUNO" ? "/api/alunos" : "/api/professores"

      await api.post(`${base}/${userSelecionado.id}/cursos/${cursoSelecionadoId}`)

      const curso = cursos.find(c => c.id === cursoSelecionadoId) ?? null

      setCursosPorUser(prev => ({ ...prev, [userSelecionado.id]: curso }))

      fecharModal()

    } catch (err) {
      console.error("Erro ao atribuir curso:", err)
      alert("Erro ao atribuir curso")
    } finally {
      setLoadingAcao(null)
    }
  }

  // Remover curso
  const removerCurso = async (user: Utilizador) => {
    const cursoAtual = cursosPorUser[user.id]
    if (!cursoAtual) return

    try {
      setLoadingAcao(user.id)

      const base =
        user.papelSistema === "ALUNO" ? "/api/alunos" : "/api/professores"

      await api.delete(`${base}/${user.id}/cursos/${cursoAtual.id}`)

      setCursosPorUser(prev => ({ ...prev, [user.id]: null }))

    } catch (err) {
      console.error("Erro ao remover curso:", err)
      alert("Erro ao remover curso")
    } finally {
      setLoadingAcao(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-violet-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar gestão de utilizadores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/*HEADER + ESTATÍSTICAS*/}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Utilizadores</h1>
          <p className="text-gray-600 mb-6">Atribua cursos e gira os utilizadores da plataforma</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Alunos</p>
                  <p className="text-3xl font-bold">{alunos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Professores</p>
                  <p className="text-3xl font-bold">{professores.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cursos Disponíveis</p>
                  <p className="text-3xl font-bold">{cursos.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/*FILTROS E PESQUISA*/}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 outline-none"
                />
              </div>

              <select
                value={tipoPapelFiltro}
                onChange={(e) => setTipoPapelFiltro(e.target.value as any)}
                className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="TODOS">Todos os papéis</option>
                <option value="ALUNO">Apenas Alunos</option>
                <option value="PROFESSOR">Apenas Professores</option>
              </select>

              <select
                value={statusCursoFiltro}
                onChange={(e) => setStatusCursoFiltro(e.target.value as any)}
                className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="TODOS">Todos os status</option>
                <option value="COM_CURSO">Com curso</option>
                <option value="SEM_CURSO">Sem curso</option>
              </select>

            </div>
          </CardContent>
        </Card>

        {/*TABELA ALUNOS*/}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <GraduationCap className="w-6 h-6" />
              Alunos ({alunos.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {alunos.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <AlertCircle className="mx-auto w-12 h-12 mb-2 text-gray-400" />
                Nenhum aluno encontrado
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Utilizador</th>
                    <th className="px-6 py-4 text-left">Curso Atual</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {alunos.map(aluno => {
                    const cursoAtual = cursosPorUser[aluno.id]
                    const emLoading = loadingAcao === aluno.id

                    return (
                      <tr key={aluno.id} className="border-b hover:bg-blue-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar Aluno */}
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-semibold">
                              {aluno.nome.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{aluno.nome}</p>
                              <p className="text-sm text-gray-500">{aluno.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {cursoAtual ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300">
                              <BookOpen className="w-4 h-4 text-gray-600" />
                              <span>{cursoAtual.nome}</span>
                              <span className="text-xs text-gray-500">
                                ({cursoAtual.codigo})
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-500">
                              <AlertCircle className="w-4 h-4" />
                              Sem curso atribuído
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">

                            <Button onClick={() => abrirModal(aluno)} disabled={emLoading} className="bg-gray-900 hover:bg-gray-800 text-white" size="sm">
                              {emLoading ? "A processar..." : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Atribuir
                                </>
                              )}
                            </Button>

                            <Button onClick={() => removerCurso(aluno)} disabled={emLoading || !cursoAtual} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                              <UserX className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>

              </table>
            )}
          </CardContent>
        </Card>

        {/*TABELA PROFESSORES*/}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Users className="w-6 h-6" />
              Professores ({professores.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {professores.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <AlertCircle className="mx-auto w-12 h-12 mb-2 text-gray-400" />
                Nenhum professor encontrado
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Utilizador</th>
                    <th className="px-6 py-4 text-left">Curso Atual</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {professores.map(prof => {
                    const cursoAtual = cursosPorUser[prof.id]
                    const emLoading = loadingAcao === prof.id

                    return (
                      <tr key={prof.id} className="border-b hover:bg-purple-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar Professor*/}
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                              {prof.nome.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{prof.nome}</p>
                              <p className="text-sm text-gray-500">{prof.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {cursoAtual ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300">
                              <BookOpen className="w-4 h-4 text-gray-600" />
                              <span>{cursoAtual.nome}</span>
                              <span className="text-xs text-gray-500">
                                ({cursoAtual.codigo})
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-500">
                              <AlertCircle className="w-4 h-4" />
                              Sem curso atribuído
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">

                            <Button onClick={() => abrirModal(prof)} disabled={emLoading} className="bg-gray-900 hover:bg-gray-800 text-white" size="sm">
                              {emLoading ? "A processar..." : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Atribuir
                                </>
                              )}
                            </Button>

                            <Button onClick={() => removerCurso(prof)} disabled={emLoading || !cursoAtual} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                              <UserX className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>

              </table>
            )}
          </CardContent>
        </Card>

      </div>

      {/*MODAL ATRIBUIÇÃO*/}
      {modalAberto && userSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">

          <Card className="max-w-md w-full shadow-2xl bg-white rounded-xl overflow-hidden">
            <CardHeader className="border-b bg-white p-6">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <UserCheck className="w-5 h-5" />
                Atribuir Curso
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <label className="block text-sm mb-2 font-medium text-gray-700">Selecionar curso</label>
              <select
                value={cursoSelecionadoId}
                onChange={e => setCursoSelecionadoId(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:ring-2 focus:ring-gray-500 outline-none"
              >
                <option value="">-- Escolha um curso --</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome} ({curso.codigo})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={fecharModal} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  Cancelar
                </Button>

                {/* Botão de Confirmação */}
                <Button className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={confirmarAtribuicao}
                  disabled={!cursoSelecionadoId}
                >
                  Confirmar
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
