import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Crown, Briefcase, Code2, Plus, Trash2, UserPlus, } from "lucide-react"

type PapelScrum = "DEV" | "PO" | "SM"

type MembroEquipa = {
  idUtilizador: number
  nome: string
  papelScrum: PapelScrum
}

type Equipa = {
  id: number
  nome: string
  membros: MembroEquipa[]
}

type Projeto = {
  id: number
  nome: string
  descricao?: string
  dataInicio?: string
  dataFim?: string
  disciplinaId?: number // Garantimos que este campo existe
}

export default function ProjetoEquipas() {
  const navigate = useNavigate()
  const { projetoId } = useParams()
  const { user } = useAuth()

  const isProfessor = user?.papelSistema === "PROFESSOR"

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [loadingProjeto, setLoadingProjeto] = useState(true)

  const [equipas, setEquipas] = useState<Equipa[]>([])
  const [loadingEquipas, setLoadingEquipas] = useState(true)

  const [showModalNovaEquipa, setShowModalNovaEquipa] = useState(false)
  const [novoNomeEquipa, setNovoNomeEquipa] = useState("")

  // Carregar Projeto 
  useEffect(() => {
    async function fetchProjeto() {
      try {
        if (!projetoId) return
        const res = await api.get<Projeto>(`/api/projetos/${projetoId}`)
        setProjeto(res.data)
      } catch (err) {
        console.error("Erro ao carregar projeto", err)
      } finally {
        setLoadingProjeto(false)
      }
    }

    fetchProjeto()
  }, [projetoId])

  // Carregar Equipas + Membros 
  async function fetchEquipas() {
    if (!projetoId) return
    try {
      setLoadingEquipas(true)

      // Equipas do projeto
      const equipasRes = await api.get<{ id: number; nome: string; idProjeto: number }[]>(
        `/api/equipas/projeto/${projetoId}`,
      )

      // Para cada equipa, ir  buscar membros
      const equipasComMembros: Equipa[] = await Promise.all(
        equipasRes.data.map(async (e) => {
          try {
            const membrosRes = await api.get<{
              id: number
              idUtilizador: number
              nomeUtilizador: string
              emailUtilizador: string
              papelScrum: PapelScrum
            }[]>(`/api/equipas/${e.id}/membros`)

            const membros: MembroEquipa[] = membrosRes.data.map((m) => ({
              idUtilizador: m.idUtilizador,
              nome: m.nomeUtilizador,
              papelScrum: m.papelScrum,
            }))

            return {
              id: e.id,
              nome: e.nome,
              membros,
            }
          } catch (err) {
            console.error(`Erro ao carregar membros da equipa ${e.id}`, err)
            return {
              id: e.id,
              nome: e.nome,
              membros: [],
            }
          }
        }),
      )

      setEquipas(equipasComMembros)
    } catch (err) {
      console.error("Erro ao carregar equipas", err)
    } finally {
      setLoadingEquipas(false)
    }
  }

  useEffect(() => {
    fetchEquipas()
  }, [projetoId])

  // Estatísticas 
  const totalEquipas = equipas.length
  const totalSM = equipas.reduce(
    (acc, e) => acc + e.membros.filter((m) => m.papelScrum === "SM").length, 0,
  )
  const totalPO = equipas.reduce(
    (acc, e) => acc + e.membros.filter((m) => m.papelScrum === "PO").length, 0,
  )
  const totalDev = equipas.reduce(
    (acc, e) => acc + e.membros.filter((m) => m.papelScrum === "DEV").length, 0,
  )

  // Criar Equipa 
  async function handleCreateEquipe() {
    if (!projetoId || !novoNomeEquipa.trim()) return

    try {
      await api.post("/api/equipas", {
        nome: novoNomeEquipa.trim(),
        idProjeto: Number(projetoId),
      })

      setShowModalNovaEquipa(false)
      setNovoNomeEquipa("")
      await fetchEquipas()
    } catch (err) {
      console.error("Erro ao criar equipa", err)
      alert("Erro ao criar equipa")
    }
  }

  // Apagar Equipa
  async function handleDeleteEquipe(id: number) {
    if (!confirm("Eliminar esta equipa?")) return

    try {
      await api.delete(`/api/equipas/${id}`)
      await fetchEquipas()
    } catch (err) {
      console.error("Erro ao eliminar equipa", err)
      alert("Erro ao eliminar equipa")
    }
  }

  // Remover Membro 
  async function handleDeleteMembro(equipaId: number, idUtilizador: number) {
    if (!confirm("Remover este membro da equipa?")) return

    try {
      await api.delete(`/api/equipas/${equipaId}/membros/${idUtilizador}`)
      await fetchEquipas()
    } catch (err) {
      console.error("Erro ao remover membro", err)
      alert("Erro ao remover membro")
    }
  }

  // Navegação Voltar (CORRIGIDA)
  function handleVoltar() {
    if (projeto?.disciplinaId) {
      // Se soubermos a disciplina, voltamos para lá (Hierarquia correta)
      navigate(`/disciplinas/${projeto.disciplinaId}`)
    } else {
      // Fallback para histórico se não tivermos dados
      navigate(-1)
    }
  }

  // Loading / Erros 
  if (loadingProjeto || loadingEquipas) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        A carregar dados do projeto...
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Projeto não encontrado.
      </div>
    )
  }

  function getPapelLabel(papel: PapelScrum): string {
    if (papel === "SM") return "Scrum Master"
    if (papel === "PO") return "Product Owner"
    return "Developer"
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
          <button
            onClick={handleVoltar}
            className="flex items-center text-white/80 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>

          <h1 className="text-4xl font-bold mb-2">Equipas Scrum</h1>
          <p className="text-gray-400 text-sm">Projeto: {projeto.nome}</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEquipas}</p>
                <p className="text-gray-600 text-sm">Equipas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSM}</p>
                <p className="text-gray-600 text-sm">Scrum Masters</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPO}</p>
                <p className="text-gray-600 text-sm">Product Owners</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDev}</p>
                <p className="text-gray-600 text-sm">Developers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOTÃO NOVA EQUIPA */}
        {isProfessor && (
          <div className="max-w-6xl mx-auto flex justify-end mb-6">
            <Button
              onClick={() => setShowModalNovaEquipa(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2"
            >
              <Plus className="w-4 h-4 mr-2 text-white" />
              Nova Equipa
            </Button>
          </div>
        )}

        {/* LISTA DE EQUIPAS */}
        <div className="space-y-8">
          {equipas.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-xl shadow-md border border-gray-200"
            >
              {/* Header da equipa */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl p-8 text-white shadow-lg mb-8">
                <div>
                  <h2 className="text-xl font-semibold">{eq.nome}</h2>
                  <p className="text-sm opacity-80">
                    {eq.membros.length} {eq.membros.length === 1 ? "membro" : "membros"}
                  </p>
                </div>

                {isProfessor && (
                  <div className="flex gap-3">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate(`/projetos/${projetoId}/equipas/${eq.id}/membros`)}>
                      <UserPlus className="w-5 h-5" />
                    </Button>

                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleDeleteEquipe(eq.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Membros da equipa */}
              <div className="divide-y">
                {eq.membros.map((m) => (
                  <div
                    key={m.idUtilizador}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar com iniciais */}
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold border border-gray-300">
                        {m.nome.split(" ").map((n) => n[0]).join("")}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">{m.nome}</p>

                        {/* Badge do papel */}
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded-full mt-1
                            ${m.papelScrum === "SM"
                              ? "bg-yellow-100 text-yellow-700"
                              : m.papelScrum === "PO"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }
                          `}
                        >
                          {getPapelLabel(m.papelScrum)}
                        </span>
                      </div>
                    </div>

                    {/* Só o professor pode remover membros */}
                    {isProfessor && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteMembro(eq.id, m.idUtilizador)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Placeholder para sprints */}
              <div className="p-4 rounded-b-xl bg-gray-50 text-center">
                <button
                  onClick={() => navigate(`/projetos/${projetoId}/sprints`)}
                  className="text-gray-600 hover:text-gray-900 hover:underline text-sm font-medium"
                >
                  Ver Sprints
                </button>
              </div>
            </div>
          ))}

          {equipas.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Ainda não existem equipas para este projeto.
            </p>
          )}
        </div>
      </div>

      {/* MODAL NOVA EQUIPA */}
      {showModalNovaEquipa && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-3 bg-gray-900">
              <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-white" />
                Nova Equipa
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Equipa
                </label>
                <input type="text" value={novoNomeEquipa} onChange={(e) => setNovoNomeEquipa(e.target.value)}
                  placeholder="Ex: Equipa Alpha"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowModalNovaEquipa(false)
                  setNovoNomeEquipa("")
                }}
                  className="flex-1"
                >
                  Cancelar
                </Button>

                <Button type="button" onClick={handleCreateEquipe} disabled={!novoNomeEquipa.trim()} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                  Criar Equipa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}