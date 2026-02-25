import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ArrowLeft, Plus, CalendarDays, Target, Trash2, X, Edit, Trophy } from "lucide-react"

// Tipos para os dados da API
type Sprint = {
  id: number
  nome: string
  objetivos: string
  dataInicio: string
  dataFim: string
  projetoId: number
  estado: "PLANEADO" | "EM_CURSO" | "CONCLUIDO"
}

type Projeto = {
  id: number
  nome: string
}

export default function Sprints() {
  const { projetoId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isProfessor = user?.papelSistema === "PROFESSOR"

  // Estados
  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)

  // Modal de Criar/Editar Sprint
  const [showModal, setShowModal] = useState(false)
  const [sprintEmEdicao, setSprintEmEdicao] = useState<Sprint | null>(null) // Para saber se estamos a editar

  const [formData, setFormData] = useState({
    nome: "",
    objetivos: "",
    dataInicio: "",
    dataFim: "",
    estado: "EM_CURSO" as Sprint["estado"] // Valor por defeito
  })

  const [loadingSubmit, setLoadingSubmit] = useState(false)

  async function fetchData() {
    if (!projetoId) return
    try {
      setLoading(true)
      const [projRes, sprintsRes] = await Promise.all([
        api.get<Projeto>(`/api/projetos/${projetoId}`),
        api.get<Sprint[]>(`/api/projetos/${projetoId}/sprints`)
      ])
      setProjeto(projRes.data)

      // Ordenar sprints por data de início
      const sprintsOrdenados = sprintsRes.data.sort((a, b) =>
        new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      )
      setSprints(sprintsOrdenados)

    } catch (err) {
      console.error("Erro ao carregar dados", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projetoId])

  // Abrir Modal para Criar
  function abrirModalCriar() {
    setSprintEmEdicao(null)
    setFormData({
      nome: "",
      objetivos: "",
      dataInicio: "",
      dataFim: "",
      estado: "EM_CURSO"
    })
    setShowModal(true)
  }

  // Abrir Modal para Editar
  function abrirModalEditar(sprint: Sprint) {
    setSprintEmEdicao(sprint)
    setFormData({
      nome: sprint.nome,
      objetivos: sprint.objetivos,
      dataInicio: sprint.dataInicio,
      dataFim: sprint.dataFim,
      estado: sprint.estado || "EM_CURSO"
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!projetoId) return

    try {
      setLoadingSubmit(true)

      if (sprintEmEdicao) {
        // Aqui enviamos o estado atualizado, que pode disparar os prémios no backend!
        await api.put(`/api/sprints/${sprintEmEdicao.id}`, {
          ...formData,
          projetoId: Number(projetoId)
        })
      } else {
        //Criar
        await api.post(`/api/projetos/${projetoId}/sprints`, {
          ...formData,
          projetoId: Number(projetoId)
        })
      }

      setShowModal(false)
      await fetchData()
    } catch (err) {
      console.error("Erro ao salvar sprint", err)
      alert("Erro ao salvar sprint.")
    } finally {
      setLoadingSubmit(false)
    }
  }

  async function handleDeleteSprint(id: number) {
    if (!confirm("Tens a certeza que queres apagar este sprint?")) return
    try {
      await api.delete(`/api/sprints/${id}`)
      await fetchData()
    } catch (err) {
      console.error("Erro ao apagar", err)
      alert("Erro ao apagar sprint.")
    }
  }

  // Helper para mostrar o badge de estado
  function renderStatusBadge(status: string) {
    const styles: Record<string, string> = {
      EM_CURSO: "bg-blue-100 text-blue-700 border-blue-200",
      PLANEADO: "bg-yellow-100 text-yellow-700 border-yellow-200",
      CONCLUIDO: "bg-green-100 text-green-700 border-green-200"
    }
    const labels: Record<string, string> = {
      EM_CURSO: "Em Curso",
      PLANEADO: "Planeado",
      CONCLUIDO: "Concluído"
    }

    // Fallback para EM_CURSO se vier algo estranho
    const key = status in styles ? status : "EM_CURSO"

    return (
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[key]} flex items-center gap-1`}>
        {key === "CONCLUIDO" && <Trophy className="w-3 h-3" />}
        {labels[key]}
      </span>
    )
  }

  // RENDER
  if (loading) return <div className="flex h-screen items-center justify-center">A carregar...</div>
  if (!projeto) return <div className="flex h-screen items-center justify-center">Projeto não encontrado.</div>

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div className="relative z-10">
            <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-4xl font-bold mb-2">Sprints do Projeto</h1>
            <p className="text-indigo-100 text-lg opacity-90">{projeto.nome}</p>
          </div>
        </div>

        {/* ACTION BAR (Só Professor) */}
        {isProfessor && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={abrirModalCriar}
              className="bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Sprint
            </Button>
          </div>
        )}

        {/* LISTA DE SPRINTS */}
        <div className="grid gap-6">
          {sprints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Sem Sprints definidos</h3>
              <p className="text-gray-500 mt-1">
                {isProfessor ? "Cria o primeiro sprint para começar." : "O professor ainda não definiu sprints."}
              </p>
            </div>
          ) : (
            sprints.map((sprint) => (
              <Card key={sprint.id} className={`border-l-4 shadow-sm hover:shadow-md transition-shadow
                  ${sprint.estado === 'CONCLUIDO' ? 'border-l-green-500 bg-green-50/30' :
                  sprint.estado === 'PLANEADO' ? 'border-l-yellow-500' : 'border-l-blue-500'}
                `}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                    {/* Info Principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{sprint.nome}</h3>
                        {renderStatusBadge(sprint.estado)}
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mb-4 bg-white border border-gray-200 w-fit px-3 py-1 rounded-md shadow-sm">
                        <CalendarDays className="w-4 h-4 mr-2 text-violet-600" />
                        <span>
                          {new Date(sprint.dataInicio).toLocaleDateString('pt-PT')}
                          {' '}<span className="text-gray-400 mx-1">➔</span>{' '}
                          {new Date(sprint.dataFim).toLocaleDateString('pt-PT')}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Objetivos
                        </h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {sprint.objetivos || "Sem objetivos definidos."}
                        </p>
                      </div>
                    </div>

                    {/* Ações (Só Professor) */}
                    {isProfessor && (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalEditar(sprint)}
                          className="justify-start hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-2 text-gray-600" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSprint(sprint.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Apagar
                        </Button>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>

      {/* MODAL CRIAR/EDITAR SPRINT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-900 to-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {sprintEmEdicao ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {sprintEmEdicao ? "Editar Sprint" : "Novo Sprint"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* NOME */}
              <div>
                <Label htmlFor="nome">Nome do Sprint</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Sprint 1 - Planeamento"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              {/* DATAS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inicio">Data Início</Label>
                  <Input
                    id="inicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={e => setFormData({ ...formData, dataInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fim">Data Fim</Label>
                  <Input
                    id="fim"
                    type="date"
                    value={formData.dataFim}
                    onChange={e => setFormData({ ...formData, dataFim: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* OBJETIVOS */}
              <div>
                <Label htmlFor="objetivos">Objetivos</Label>
                <textarea
                  id="objetivos"
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  placeholder="Descreve os principais objetivos deste sprint..."
                  value={formData.objetivos}
                  onChange={e => setFormData({ ...formData, objetivos: e.target.value })}
                />
              </div>

              {/* ESTADO  */}
              <div>
                <Label htmlFor="estado" className="text-gray-700">Estado da Sprint</Label>
                <select
                  id="estado"
                  className="w-full mt-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                >
                  <option value="PLANEADO">Planeado</option>
                  <option value="EM_CURSO">Em Curso</option>
                  <option value="CONCLUIDO">Concluído (Atribui Prémios)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ao mudar para "Concluído" dentro do prazo, os alunos recebem prémios automaticamente.
                </p>
              </div>

              {/* BOTÕES */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>

                <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white" disabled={loadingSubmit}>
                  {loadingSubmit ? "A guardar..." : (sprintEmEdicao ? "Atualizar" : "Criar")}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}