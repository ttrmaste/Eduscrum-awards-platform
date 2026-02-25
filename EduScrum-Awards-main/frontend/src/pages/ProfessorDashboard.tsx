import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, BookOpen, ArrowRight, BarChart2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

//Tipos para os dados da API
type Disciplina = {
  id: number
  nome: string
  codigo: string
  cursoId: number
}

type Curso = {
  id: number
  nome: string
  disciplinas: Disciplina[]
}

type ProjetoSimple = {
  id: number
  nome: string
}

type Stats = {
  totalDisciplinas: number
  totalEquipas: number
  totalAlunos: number
  totalPremios: number
}

type GraphData = {
  name: string      // Nome da Equipa
  pontos: number    // Média de Pontos
}

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [cursos, setCursos] = useState<Curso[]>([])
  const [todasDisciplinas, setTodasDisciplinas] = useState<Disciplina[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDisciplinas: 0,
    totalEquipas: 0,
    totalAlunos: 0,
    totalPremios: 0
  })

  //Estados do Gráfico de pontos 
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>("")
  const [projetosDisciplina, setProjetosDisciplina] = useState<ProjetoSimple[]>([])
  const [selectedProjetoId, setSelectedProjetoId] = useState<string>("")
  const [graphData, setGraphData] = useState<GraphData[]>([])

  const [loading, setLoading] = useState(true)

  //Carregar dados gerais
  useEffect(() => {
    //Verifica se user existe E se user.id existe
    if (!user || !user.id) {
      console.warn("A aguardar ID do utilizador...");
      return;
    }

    async function fetchDados() {
      try {
        setLoading(true)

        // Buscar Cursos do Professor
        const resCursos = await api.get<Curso[]>(`/api/professores/${user?.id}/cursos`)
        setCursos(resCursos.data)

        // Extrair todas as disciplinas
        const disciplinas = resCursos.data.flatMap(c => c.disciplinas || [])
        setTodasDisciplinas(disciplinas)

        // Se houver disciplinas, seleciona a primeira automaticamente para o gráfico
        if (disciplinas.length > 0) {
          setSelectedDisciplinaId(String(disciplinas[0].id))
        }

        // Calcular Stats
        let totalAlunosCount = 0
        let totalPremiosCount = 0

        for (const curso of resCursos.data) {
          try {
            const resAlunos = await api.get<any[]>(`/api/cursos/${curso.id}/alunos`)
            totalAlunosCount += resAlunos.data.length

            for (const aluno of resAlunos.data) {
              const resConquistas = await api.get<any[]>(`/api/alunos/${aluno.id}/conquistas`)
              totalPremiosCount += resConquistas.data.length
            }
          } catch (e) { console.error(e) }
        }

        setStats({
          totalDisciplinas: disciplinas.length,
          totalAlunos: totalAlunosCount,
          totalEquipas: 0,
          totalPremios: totalPremiosCount
        })

      } catch (error) {
        console.error("Erro ao carregar dashboard professor", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDados()
  }, [user])

  //Carregas projetos quando se muda a disciplina
  useEffect(() => {
    if (!selectedDisciplinaId) return

    async function fetchProjetos() {
      try {
        //Endpoint para buscar projetos da disciplina 
        const res = await api.get<ProjetoSimple[]>(`/api/disciplinas/${selectedDisciplinaId}/projetos`)
        setProjetosDisciplina(res.data)

        //Seleciona o primeiro projeto automaticamente se existir
        if (res.data.length > 0) {
          setSelectedProjetoId(String(res.data[0].id))
        } else {
          setSelectedProjetoId("")
          setGraphData([])
        }
      } catch (err) {
        console.error("Erro ao buscar projetos da disciplina", err)
        setProjetosDisciplina([])
      }
    }

    fetchProjetos()
  }, [selectedDisciplinaId])

  //Carregar dados do gráfico quando se muda de projeto
  useEffect(() => {
    if (!selectedProjetoId) return

    async function fetchGraphData() {
      try {
        const res = await api.get<any[]>(`/api/rankings/equipas/projeto/${selectedProjetoId}`)

        //Mapeia para o formato do Recharts
        const formattedData = res.data.map(item => ({
          name: item.nomeEquipa,
          pontos: item.mediaPontos
        }))

        setGraphData(formattedData)
      } catch (err) {
        console.error("Erro ao carregar dados do gráfico", err)
        setGraphData([])
      }
    }

    fetchGraphData()
  }, [selectedProjetoId])


  const COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']

  if (loading) return <div className="p-10 text-center text-gray-500">A carregar o teu painel...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header*/}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-400">Dashboard do Professor</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Olá, Professor {user?.nome?.split(" ")[0]}!
            </h1>
            <p className="text-gray-400">
              A gerir <strong>{stats.totalDisciplinas} disciplinas</strong> e <strong>{stats.totalAlunos} alunos</strong>.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <BookOpen className="w-12 h-12 text-white-500" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-violet-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Minhas Disciplinas</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalDisciplinas}</p>
            </div>
            <div className="p-3 bg-violet-100 rounded-full text-violet-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total de Alunos</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalAlunos}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Prémios Atribuídos</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalPremios}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Lista de Disciplinas */}
        <Card className="lg:col-span-2 shadow-sm h-full">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              As Minhas Disciplinas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todasDisciplinas.length > 0 ? (
              <div className="divide-y">
                {todasDisciplinas.map((disc) => (
                  <div key={disc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <h4 className="font-semibold text-gray-800">{disc.nome}</h4>
                      <p className="text-sm text-gray-500">{disc.codigo}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/disciplinas/${disc.id}/premios`)}>
                        <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                        Prémios
                      </Button>
                      <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => navigate(`/disciplinas/${disc.id}`)}>
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Ainda não tens disciplinas atribuídas.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de pontos por Equipa */}
        <Card className="shadow-sm flex flex-col h-full">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-green-600" />
              Pontos por Equipa
            </CardTitle>

            {/* Filtros do Gráfico */}
            <div className="space-y-3">
              {/* Select Disciplina */}
              <select
                className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                value={selectedDisciplinaId}
                onChange={(e) => setSelectedDisciplinaId(e.target.value)}
              >
                <option value="">Selecione a disciplina...</option>
                {todasDisciplinas.map(d => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>

              {/* Select Projeto */}
              <select
                className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-violet-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                value={selectedProjetoId}
                onChange={(e) => setSelectedProjetoId(e.target.value)}
                disabled={!selectedDisciplinaId || projetosDisciplina.length === 0}
              >
                <option value="">
                  {projetosDisciplina.length === 0 ? "Sem projetos" : "Selecione o projeto..."}
                </option>
                {projetosDisciplina.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-grow flex flex-col justify-center">
            {graphData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="pontos" radius={[4, 4, 0, 0]} barSize={40}>
                      {graphData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center text-gray-400 mt-4">
                  Média de pontos dos membros da equipa
                </p>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl border-gray-100">
                <BarChart2 className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Selecione um projeto para ver os dados.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}