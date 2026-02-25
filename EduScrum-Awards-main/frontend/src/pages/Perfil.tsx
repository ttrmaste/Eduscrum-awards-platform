import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Trophy, Star, BookOpen, Users, Lock, Bell, Moon, GraduationCap } from "lucide-react"

// Tipos auxiliares para contagens
type Conquista = {
  id: number
  premio: { valorPontos: number }
}

type Curso = {
  id: number
  disciplinas?: any[]
}

export default function Perfil() {
  const { user } = useAuth()

  const isAdmin = user?.papelSistema === "ADMIN"
  const isProfessor = user?.papelSistema === "PROFESSOR"
  const isAluno = user?.papelSistema === "ALUNO"

  //Preferências locais
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)

  //Estados para Estatísticas 
  const [stats, setStats] = useState({
    valor1: 0, // Aluno: Pontos | Prof: Cursos
    valor2: 0, // Aluno: Prémios | Prof: Disciplinas
    valor3: 0  // Aluno: Cursos | Prof: Alunos
  })
  const [loadingStats, setLoadingStats] = useState(true)

  //Carregar Dados Reais
  useEffect(() => {
    if (!user || isAdmin) {
      setLoadingStats(false)
      return
    }

    async function fetchStats() {
      try {
        if (isAluno) {
          //LÓGICA ALUNO 
          //Buscar Conquistas 
          const resConquistas = await api.get<Conquista[]>(`/api/alunos/${user.id}/conquistas`)
          const totalPontos = resConquistas.data.reduce((acc, c) => acc + c.premio.valorPontos, 0)
          const totalPremios = resConquistas.data.length

          //Buscar Cursos Inscritos
          const resCursos = await api.get<any[]>(`/api/alunos/${user.id}/cursos`)
          const totalCursos = resCursos.data.length

          setStats({ valor1: totalPontos, valor2: totalPremios, valor3: totalCursos })

        } else if (isProfessor) {
          //LÓGICA PROFESSOR 
          //Buscar Cursos Lecionados
          const resCursos = await api.get<Curso[]>(`/api/professores/${user.id}/cursos`)
          const meusCursos = resCursos.data

          //Contar Disciplinas
          const totalDisciplinas = meusCursos.reduce((acc, c) => acc + (c.disciplinas?.length || 0), 0)

          //Contar Alunos
          let totalAlunos = 0
          for (const curso of meusCursos) {
            try {
              const resAlunos = await api.get<any[]>(`/api/cursos/${curso.id}/alunos`)
              totalAlunos += resAlunos.data.length
            } catch { }
          }

          setStats({ valor1: meusCursos.length, valor2: totalDisciplinas, valor3: totalAlunos })
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas do perfil", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [user, isAluno, isProfessor, isAdmin])


  // Configuração dos Cards com base nos dados reais
  const cardsEstatisticas = isProfessor ? [
    { label: "Cursos", value: stats.valor1, icon: BookOpen, color: "text-violet-600" },
    { label: "Disciplinas", value: stats.valor2, icon: BookOpen, color: "text-blue-600" }, // Ícone repetido ou usar Library
    { label: "Total Alunos", value: stats.valor3, icon: Users, color: "text-emerald-600" },
  ] : [ // Aluno
    { label: "Pontos Totais", value: stats.valor1, icon: Trophy, color: "text-yellow-500" },
    { label: "Prémios Ganhos", value: stats.valor2, icon: Star, color: "text-orange-500" },
    { label: "Cursos Inscritos", value: stats.valor3, icon: GraduationCap, color: "text-blue-600" },
  ]

  // Avatar básico com iniciais
  const initials = (user?.nome || "Utilizador")
    .split(" ")
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("")

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-2xl border border-gray-300">
          {initials || "U"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Meu Perfil
          </h1>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            {isAdmin ? "Administrador" : isProfessor ? "Docente" : "Estudante"}
          </span>
        </div>
      </div>

      {/* CARTÕES DE ESTATÍSTICAS */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cardsEstatisticas.map((s, i) => (
            <Card key={i} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-full bg-gray-50 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingStats ? "-" : s.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="w-5 h-5" />
              Dados da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> Nome Completo
                </Label>
                <p className="text-lg font-medium text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {user?.nome}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <p className="text-lg font-medium text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Papel no Sistema
              </Label>
              <p className="text-base font-medium text-gray-700">
                {user?.papelSistema}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Segurança da Conta */}
        <Card className="shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Lock className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Recomendamos que atualizes a tua palavra-passe a cada 3 meses para manter a conta segura.
            </p>
            <button
              type="button"
              className="w-full py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition shadow-sm"
              onClick={() => alert("Funcionalidade futura: Modal de alteração de password")}
            >
              Alterar password
            </button>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Bell className="w-5 h-5" />
              Preferências de Aplicação
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => setDarkMode(v => !v)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Moon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Modo Escuro</p>
                  <p className="text-sm text-gray-500">Ajustar aparência para ambientes escuros</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${darkMode ? "translate-x-6" : ""}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => setEmailNotifs(v => !v)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notificações</p>
                  <p className="text-sm text-gray-500">Receber alertas de atividade por email</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${emailNotifs ? "bg-gray-900" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${emailNotifs ? "translate-x-6" : ""}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}