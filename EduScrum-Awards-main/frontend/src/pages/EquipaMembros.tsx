import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { ArrowLeft, Users, Trash2, UserPlus, X } from "lucide-react"

type PapelScrum = "SM" | "PO" | "DEV"

type MembroEquipa = {
  id: number
  idUtilizador: number
  nomeUtilizador: string
  emailUtilizador: string
  papelScrum: PapelScrum
}

type EquipaDTO = {
  id: number
  nome: string
  idProjeto?: number | null
}

// Tipo simples para listar utilizadores no select
type AlunoCandidato = {
  id: number
  nome: string
  email: string
}

export default function EquipaMembros() {
  const navigate = useNavigate()
  const { projetoId, equipaId } = useParams()
  const { user } = useAuth()

  const isProfessor = user?.papelSistema === "PROFESSOR"

  const [equipa, setEquipa] = useState<EquipaDTO | null>(null)
  const [membros, setMembros] = useState<MembroEquipa[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para o Modal de Adicionar Membro
  const [showModalAdicionar, setShowModalAdicionar] = useState(false)
  const [alunosCandidatos, setAlunosCandidatos] = useState<AlunoCandidato[]>([])
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | "">("")
  const [selectedPapel, setSelectedPapel] = useState<PapelScrum>("DEV")
  const [loadingAdd, setLoadingAdd] = useState(false)

  //Carregar dados da equipa + membros
  async function fetchDados() {
    if (!equipaId) return
    try {
      setLoading(true)
      const [equipaRes, membrosRes] = await Promise.all([
        api.get<EquipaDTO>(`/api/equipas/${equipaId}`),
        api.get<MembroEquipa[]>(`/api/equipas/${equipaId}/membros`),
      ])
      setEquipa(equipaRes.data)
      setMembros(membrosRes.data)
    } catch (err) {
      console.error("Erro ao carregar equipa/membros", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDados()
  }, [equipaId])

  //Buscar lista de alunos para adicionar (Chamado ao abrir modal)
  async function fetchAlunosCandidatos() {
    try {
      const res = await api.get<any[]>("/api/utilizadores")

      //Filtra apenas alunos
      const todosAlunos = res.data.filter((u) => u.papelSistema === "ALUNO")

      //Remove quem já está na equipa
      const idsNaEquipa = membros.map((m) => m.idUtilizador)
      const candidatos = todosAlunos.filter((a) => !idsNaEquipa.includes(a.id))

      setAlunosCandidatos(candidatos)
    } catch (err) {
      console.error("Erro ao buscar alunos", err)
    }
  }

  function handleAbrirAdicionarMembro() {
    fetchAlunosCandidatos()
    setSelectedAlunoId("")
    setSelectedPapel("DEV")
    setShowModalAdicionar(true)
  }

  //Adicionar membro
  async function handleAddMembro() {
    if (!equipaId || !selectedAlunoId) return

    try {
      setLoadingAdd(true)
      await api.post(`/api/equipas/${equipaId}/membros`, {
        idUtilizador: Number(selectedAlunoId),
        papelScrum: selectedPapel,
      })

      setShowModalAdicionar(false)
      await fetchDados() // Recarrega a lista
    } catch (err) {
      console.error("Erro ao adicionar membro", err)
      alert("Erro ao adicionar membro. Verifica se o aluno já pertence à equipa.")
    } finally {
      setLoadingAdd(false)
    }
  }

  //Remover membro
  async function handleRemoverMembro(idUtilizador: number) {
    if (!equipaId) return
    if (!confirm("Remover este membro da equipa?")) return

    try {
      await api.delete(`/api/equipas/${equipaId}/membros/${idUtilizador}`)
      await fetchDados()
    } catch (err) {
      console.error("Erro ao remover membro", err)
      alert("Erro ao remover membro")
    }
  }

  //Helpers
  function getPapelLabel(papel: string): string {
    if (papel === "SCRUM_MASTER" || papel === "SM") return "Scrum Master"
    if (papel === "PRODUCT_OWNER" || papel === "PO") return "Product Owner"
    return "Developer"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        A carregar equipa...
      </div>
    )
  }

  if (!equipa) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Equipa não encontrada.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
          <button onClick={() => navigate(`/projetos/${projetoId}/equipas`)}
            className="flex items-center text-white hover:text-white/80 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar às equipas
          </button>

          <h1 className="text-3xl font-bold mb-1">{equipa.nome}</h1>
          <p className="text-indigo-100 text-sm">Gestão de membros da equipa</p>
        </div>

        {/* CARD LISTA DE MEMBROS */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Membros da Equipa</h2>
                  <p className="text-sm text-gray-500">
                    {membros.length} {membros.length === 1 ? "membro" : "membros"}
                  </p>
                </div>
              </div>

              {isProfessor && (
                <Button onClick={handleAbrirAdicionarMembro} className="bg-gray-900 hover:bg-gray-800 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar membro
                </Button>
              )}
            </div>

            <div className="divide-y">
              {membros.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar com iniciais  */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold text-sm border border-gray-300">
                      {m.nomeUtilizador
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">{m.nomeUtilizador}</p>
                      <p className="text-xs text-gray-500">{m.emailUtilizador}</p>
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

                  {/* Só professor pode remover */}
                  {isProfessor && (
                    <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleRemoverMembro(m.idUtilizador)}><Trash2 className="w-5 h-5" /></Button>
                  )}
                </div>
              ))}

              {membros.length === 0 && (
                <p className="text-sm text-gray-500 pt-2 text-center">
                  Ainda não há membros nesta equipa.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NOTA PARA ALUNO */}
        {!isProfessor && (
          <p className="text-sm text-gray-500 text-center">
            Só o professor pode adicionar ou remover membros da equipa.
          </p>
        )}
      </div>

      {/* MODAL ADICIONAR MEMBRO */}
      {showModalAdicionar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800">Adicionar Membro</h3>
              <button onClick={() => setShowModalAdicionar(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Select Aluno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aluno
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                  value={selectedAlunoId}
                  onChange={(e) => setSelectedAlunoId(Number(e.target.value))}
                >
                  <option value="">Selecione um aluno...</option>
                  {alunosCandidatos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.email})
                    </option>
                  ))}
                </select>
                {alunosCandidatos.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Não há alunos disponíveis (ou todos já estão na equipa).
                  </p>
                )}
              </div>

              {/* Select Papel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Papel no Scrum
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setSelectedPapel("DEV")} className={`py-2 text-xs font-medium rounded-md border transition ${selectedPapel === "DEV" ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Developer</button>
                  <button type="button" onClick={() => setSelectedPapel("SM")} className={`py-2 text-xs font-medium rounded-md border transition ${selectedPapel === "SM" ? "bg-yellow-50 border-yellow-500 text-yellow-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Scrum Master</button>
                  <button type="button" onClick={() => setSelectedPapel("PO")} className={`py-2 text-xs font-medium rounded-md border transition ${selectedPapel === "PO" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Product Owner</button>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowModalAdicionar(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleAddMembro} disabled={!selectedAlunoId || loadingAdd} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">{loadingAdd ? "A adicionar..." : "Adicionar"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}