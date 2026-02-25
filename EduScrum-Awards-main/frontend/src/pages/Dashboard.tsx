import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, TrendingUp, FolderOpen, CalendarDays } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

//Tipos para os dados da API
type Premio = {
  id: number
  nome: string
  descricao: string
  valorPontos: number
  tipo: string
}

type Conquista = {
  id: number
  dataAtribuicao: string
  premio: Premio
}

type Projeto = {
  id: number
  nome: string
  dataFim: string
}

export default function Dashboard() {
  const { user } = useAuth()

  const [conquistas, setConquistas] = useState<Conquista[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [totalPontos, setTotalPontos] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchDados() {
      try {
        setLoading(true)

        //Buscar Conquistas Reais
        const resConquistas = await api.get<Conquista[]>(`/api/alunos/${user?.id}/conquistas`)
        setConquistas(resConquistas.data)

        //Calcular Total de Pontos 
        const somaPontos = resConquistas.data.reduce((acc, c) => acc + c.premio.valorPontos, 0)
        setTotalPontos(somaPontos)

        //Buscar Projetos/Cursos do Aluno para contar ativos
        const resCursos = await api.get(`/api/alunos/${user?.id}/cursos`)
        setProjetos(resCursos.data)

      } catch (error) {
        console.error("Erro ao carregar dashboard", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDados()
  }, [user])

  // Dados simples para o gráfico
  const graficoPontos = [
    { mes: "Início", pontos: 0 },
    { mes: "Atual", pontos: totalPontos },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        A carregar o teu progresso...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-400">Dashboard do Aluno</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Olá, {user?.nome?.split(" ")[0]}!
            </h1>
            <p className="text-gray-400">
              Tens <strong className="text-white">{conquistas.length} prémios</strong> conquistados até agora.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Trophy className="w-12 h-12 text-white-500" />
          </div>
        </div>
      </div>

      {/* Cards de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <Card className="bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium mb-1">Total de Pontos</p>
                {/* Mostra o totalPontos */}
                <p className="text-4xl font-bold text-violet-700">{totalPontos}</p>
              </div>
              <Trophy className="w-12 h-12 text-violet-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium mb-1">Prémios Recebidos</p>
                {/* Mostra as conquistas */}
                <p className="text-4xl font-bold text-amber-700">{conquistas.length}</p>
              </div>
              <Star className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Cursos Ativos</p>
                <p className="text-4xl font-bold text-blue-700">{projetos.length}</p>
              </div>
              <FolderOpen className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Lista de Conquistas */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              As tuas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {conquistas.length > 0 ? (
              <div className="space-y-4">
                {conquistas.map((c) => (
                  <div key={c.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{c.premio.nome}</h4>
                          <p className="text-sm text-gray-600">{c.premio.descricao}</p>
                        </div>
                        <span className="font-bold text-dark-600 bg-violet-50 px-3 py-1 rounded-full text-sm">
                          +{c.premio.valorPontos} pts
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        {new Date(c.dataAtribuicao).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Ainda não tens conquistas. Continua a trabalhar!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Simples */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Evolução
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficoPontos}>
                  <XAxis dataKey="mes" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="pontos" stroke="#010101ff" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="font-bold text-center text-sm text-gray-500 mt-4">
              Começaste com 0 e já vais em {totalPontos} pontos!
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}