import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from "@/context/AuthContext"
import { Button } from '@/components/ui/button'
import { BookOpen, Users, GraduationCap, TrendingUp, Plus, Edit, Trash2, Shield } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from "@/lib/api"

//Tipos para os dados da API
type Curso = {
  id: number
  nome: string
  codigo: string
  adminId: number
  numAlunos?: number
  numProfessores?: number
  numProjetos?: number
}

type Utilizador = {
  id: number
  papelSistema: "ALUNO" | "PROFESSOR" | "ADMIN"
}

type Stats = {
  totalCursos: number
  totalProfessores: number
  totalAlunos: number
  totalProjetos: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCursos: 0,
    totalProfessores: 0,
    totalAlunos: 0,
    totalProjetos: 0
  })

  // Estados para Gráficos
  const [dadosPie, setDadosPie] = useState<any[]>([])
  const [dadosBarra, setDadosBarra] = useState<any[]>([])

  // Estados de Gestão (Modal)
  const [cursoEditar, setCursoEditar] = useState<Curso | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [novoCurso, setNovoCurso] = useState({ nome: '', codigo: '' })
  const [loading, setLoading] = useState(true)

  //Carregar dados
  async function loadData() {
    try {
      setLoading(true)

      //Buscar Cursos
      const cursosRes = await api.get<Curso[]>('/api/cursos')
      const cursosData = cursosRes.data

      //Buscar Utilizadores 
      const usersRes = await api.get<Utilizador[]>('/api/utilizadores')
      const users = usersRes.data

      const countAlunos = users.filter(u => u.papelSistema === 'ALUNO').length
      const countProfs = users.filter(u => u.papelSistema === 'PROFESSOR').length

      //Enriquecer Cursos (Contar Projetos, Alunos, Professores por curso)
      let totalProjetosSistema = 0
      const cursosEnriquecidos = await Promise.all(cursosData.map(async (curso) => {
        try {
          const [alunosRes, profsRes, projetosRes] = await Promise.all([
            api.get(`/api/cursos/${curso.id}/alunos`),
            api.get(`/api/cursos/${curso.id}/professores`),
            api.get(`/api/cursos/${curso.id}/projetos`)
          ])

          const qtdProjetos = projetosRes.data.length
          totalProjetosSistema += qtdProjetos

          return {
            ...curso,
            numAlunos: alunosRes.data.length,
            numProfessores: profsRes.data.length,
            numProjetos: qtdProjetos
          }
        } catch (e) {
          console.error("Erro ao enriquecer curso", curso.id)
          return curso
        }
      }))

      setCursos(cursosEnriquecidos)

      setStats({
        totalCursos: cursosData.length,
        totalAlunos: countAlunos,
        totalProfessores: countProfs,
        totalProjetos: totalProjetosSistema
      })

      //Preparar Dados para Gráficos
      setDadosPie([
        { name: 'Alunos', value: countAlunos },
        { name: 'Professores', value: countProfs },
      ])

      // Top 5 cursos com mais projetos
      const topCursos = cursosEnriquecidos
        .sort((a, b) => (b.numProjetos || 0) - (a.numProjetos || 0))
        .slice(0, 5)
        .map(c => ({
          name: c.codigo,
          projetos: c.numProjetos || 0
        }))

      setDadosBarra(topCursos)

    } catch (err) {
      console.error('Erro ao carregar dados admin:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  //Ações
  const handleCreateCurso = async () => {
    try {
      if (!user?.id) {
        alert("Erro: Utilizador não autenticado.")
        return
      }

      await api.post('/api/cursos', {
        nome: novoCurso.nome,
        codigo: novoCurso.codigo,
        adminId: user.id
      })

      setShowCreateModal(false)
      setNovoCurso({ nome: '', codigo: '' })
      loadData()
    } catch (err) {
      console.error('Erro ao criar curso:', err)
      alert("Erro ao criar curso")
    }
  }

  const handleUpdateCurso = async () => {
    if (!cursoEditar) return
    try {
      await api.put(`/api/cursos/${cursoEditar.id}`, {
        nome: cursoEditar.nome,
        codigo: cursoEditar.codigo,
        adminId: cursoEditar.adminId
      })
      setCursoEditar(null)
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      console.error("Erro ao editar curso:", error)
    }
  }

  const handleDeleteCurso = async (id: number) => {
    if (!confirm('Tem certeza que deseja eliminar este curso?')) return
    try {
      await api.delete(`/api/cursos/${id}`)
      loadData()
    } catch (err) {
      console.error('Erro ao eliminar curso:', err)
    }
  }

  // Cores para o Pie Chart
  const COLORS = ['#105fb9ff', '#8b5cf6']

  if (loading) return <div className="p-10 text-center">A carregar painel de administração...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-400">Dashboard do Administrador</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Olá, {user?.nome?.split(" ")[0]}!
            </h1>
            <p className="text-gray-400">
              Gestão global do sistema EduScrum Awards
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Shield className="w-12 h-12 text-white-500" />
          </div>
        </div>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-600 font-medium">Cursos</p>
              <p className="text-3xl font-bold text-blue-700">{stats.totalCursos}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-400" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-purple-600 font-medium">Professores</p>
              <p className="text-3xl font-bold text-purple-700">{stats.totalProfessores}</p>
            </div>
            <Users className="w-10 h-10 text-purple-400" />
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-green-600 font-medium">Alunos</p>
              <p className="text-3xl font-bold text-green-700">{stats.totalAlunos}</p>
            </div>
            <GraduationCap className="w-10 h-10 text-green-400" />
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-orange-600 font-medium">Projetos Ativos</p>
              <p className="text-3xl font-bold text-orange-700">{stats.totalProjetos}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-400" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Distribuição de Utilizadores */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Distribuição de Utilizadores</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <div className="h-[250px] w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dadosPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Alunos</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-violet-500"></div> Professores</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projetos por Curso */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Top Cursos com Mais Projetos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarra}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="projetos" fill="#000000ff" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestão de Cursos */}
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Gestão de Cursos</CardTitle>
            <Button onClick={() => { setCursoEditar(null); setNovoCurso({ nome: "", codigo: "" }); setShowCreateModal(true) }} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2 text-white" />
              Novo Curso
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-sm uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Curso</th>
                  <th className="px-6 py-3 text-center">Código</th>
                  <th className="px-6 py-3 text-center">Alunos</th>
                  <th className="px-6 py-3 text-center">Professores</th>
                  <th className="px-6 py-3 text-center">Projetos</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cursos.map((curso) => (
                  <tr key={curso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{curso.nome}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-black-700 text-xs rounded-md font-bold">
                        {curso.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{curso.numAlunos}</td>
                    <td className="px-6 py-4 text-center">{curso.numProfessores}</td>
                    <td className="px-6 py-4 text-center">{curso.numProjetos}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => {
                          setCursoEditar(curso)
                          setShowCreateModal(true)
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteCurso(curso.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Criar/Editar */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{cursoEditar ? "Editar Curso" : "Novo Curso"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={cursoEditar ? cursoEditar.nome : novoCurso.nome}
                  onChange={e => cursoEditar ? setCursoEditar({ ...cursoEditar, nome: e.target.value }) : setNovoCurso({ ...novoCurso, nome: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  value={cursoEditar ? cursoEditar.codigo : novoCurso.codigo}
                  onChange={e => cursoEditar ? setCursoEditar({ ...cursoEditar, codigo: e.target.value }) : setNovoCurso({ ...novoCurso, codigo: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                <Button className="flex-1 bg-violet-600 text-white hover:bg-violet-700" onClick={cursoEditar ? handleUpdateCurso : handleCreateCurso}>Guardar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}