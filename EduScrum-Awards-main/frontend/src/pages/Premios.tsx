import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ArrowLeft, Plus, Trophy, Star, Award, Trash2, X, UserCheck } from "lucide-react"

//Tipos de dados 
type Premio = {
  id: number
  nome: string
  descricao: string
  valorPontos: number
  tipo: "MANUAL" | "AUTOMATICO"
  disciplinaId: number
}

type Disciplina = {
  id: number
  nome: string
  cursoId: number
}

type Aluno = {
  id: number
  nome: string
  email: string
}

export default function Premios() {
  const { disciplinaId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isProfessor = user?.papelSistema === "PROFESSOR"

  // ESTADOS 
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
  const [premios, setPremios] = useState<Premio[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Criar Prémio
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [novoPremio, setNovoPremio] = useState({
    nome: "",
    descricao: "",
    valorPontos: 10,
    tipo: "MANUAL"
  })
  const [loadingCriar, setLoadingCriar] = useState(false)

  // Modal Atribuir Prémio
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPremio, setSelectedPremio] = useState<Premio | null>(null)
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | "">("")
  const [loadingAtribuir, setLoadingAtribuir] = useState(false)

  //API
  async function fetchData() {
    if (!disciplinaId) return
    try {
      setLoading(true)

      //Buscar Disciplina
      const discRes = await api.get<Disciplina>(`/api/disciplinas/${disciplinaId}`)
      setDisciplina(discRes.data)

      //Buscar Prémios da Disciplina
      const premiosRes = await api.get<Premio[]>(`/api/disciplinas/${disciplinaId}/premios`)
      setPremios(premiosRes.data)

      //Se for professor, buscar alunos do curso 
      if (isProfessor && discRes.data.cursoId) {
        const alunosRes = await api.get<Aluno[]>(`/api/cursos/${discRes.data.cursoId}/alunos`)
        setAlunos(alunosRes.data)
      }

    } catch (err) {
      console.error("Erro ao carregar dados", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [disciplinaId])

  //CRIAR 
  async function handleCriarPremio(e: React.FormEvent) {
    e.preventDefault()
    if (!disciplinaId) return

    try {
      setLoadingCriar(true)
      await api.post(`/api/disciplinas/${disciplinaId}/premios`, {
        ...novoPremio,
        disciplinaId: Number(disciplinaId)
      })

      setShowCreateModal(false)
      setNovoPremio({ nome: "", descricao: "", valorPontos: 10, tipo: "MANUAL" })
      await fetchData()
    } catch (err) {
      console.error("Erro ao criar prémio", err)
      alert("Erro ao criar prémio.")
    } finally {
      setLoadingCriar(false)
    }
  }

  //ATRIBUIR 
  function abrirModalAtribuir(premio: Premio) {
    setSelectedPremio(premio)
    setSelectedAlunoId("")
    setShowAssignModal(true)
  }

  async function handleAtribuirPremio() {
    if (!selectedPremio || !selectedAlunoId) return

    try {
      setLoadingAtribuir(true)
      await api.post(`/api/premios/${selectedPremio.id}/atribuir/${selectedAlunoId}`)

      alert(`Prémio "${selectedPremio.nome}" atribuído com sucesso!`)
      setShowAssignModal(false)
    } catch (err) {
      console.error("Erro ao atribuir prémio", err)
      alert("Erro ao atribuir prémio.")
    } finally {
      setLoadingAtribuir(false)
    }
  }

  //RENDER 
  if (loading) return <div className="flex h-screen items-center justify-center">A carregar prémios...</div>
  if (!disciplina) return <div className="flex h-screen items-center justify-center">Disciplina não encontrada.</div>

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-4xl font-bold mb-2">Prémios & Gamificação</h1>
            <p className="text-orange-100 text-lg opacity-90">{disciplina.nome}</p>
          </div>
          <Trophy className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 text-white opacity-10" />
        </div>

        {/* ACTION BAR */}
        {isProfessor && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Prémio
            </Button>
          </div>
        )}

        {/* GRID DE PRÉMIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premios.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Sem prémios criados</h3>
              <p className="text-gray-500 mt-1">
                Cria prémios para motivar os teus alunos!
              </p>
            </div>
          ) : (
            premios.map((premio) => (
              <Card key={premio.id} className="group hover:shadow-lg transition-all border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    <span className="font-bold text-lg text-orange-600">
                      +{premio.valorPontos} pts
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{premio.nome}</h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {premio.descricao}
                  </p>

                  {isProfessor && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => abrirModalAtribuir(premio)}
                        className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Atribuir
                      </Button>
                      {/* Futuro: Editar/Apagar */}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>

      {/* MODAL CRIAR PRÉMIO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-orange-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Novo Prémio</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarPremio} className="p-6 space-y-4">
              <div>
                <Label>Nome do Prémio</Label>
                <Input
                  placeholder="Ex: Rei do Código"
                  value={novoPremio.nome}
                  onChange={e => setNovoPremio({ ...novoPremio, nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Código limpo e sem bugs"
                  value={novoPremio.descricao}
                  onChange={e => setNovoPremio({ ...novoPremio, descricao: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Valor em Pontos</Label>
                <Input
                  type="number"
                  min="1"
                  value={novoPremio.valorPontos}
                  onChange={e => setNovoPremio({ ...novoPremio, valorPontos: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={loadingCriar}>
                  {loadingCriar ? "A criar..." : "Criar Prémio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATRIBUIR PRÉMIO */}
      {showAssignModal && selectedPremio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Atribuir Prémio</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-2">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPremio.nome}</h3>
                <p className="text-gray-500">Este prémio vale <span className="font-bold text-orange-600">{selectedPremio.valorPontos} pontos</span></p>
              </div>

              <div>
                <Label className="mb-2 block">Selecionar Aluno</Label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={selectedAlunoId}
                  onChange={(e) => setSelectedAlunoId(Number(e.target.value))}
                >
                  <option value="">-- Escolha um aluno --</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.email})
                    </option>
                  ))}
                </select>
                {alunos.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Não há alunos inscritos no curso desta disciplina.</p>
                )}
              </div>

              <Button
                onClick={handleAtribuirPremio}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={!selectedAlunoId || loadingAtribuir}
              >
                {loadingAtribuir ? "A atribuir..." : "Confirmar Atribuição"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}