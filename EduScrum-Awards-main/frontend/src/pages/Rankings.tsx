import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trophy, Medal, User, Users, Star, LayoutList } from "lucide-react"

// Tipos de dados
type AlunoRanking = {
    id: number
    nome: string
    totalPontos: number
}

type EquipaRanking = {
    idEquipa: number
    nomeEquipa: string
    mediaPontos: number
    totalPontosMembros: number
}

type ProjetoSimple = {
    id: number
    nome: string
}

export default function Rankings() {
    const [rankingAlunos, setRankingAlunos] = useState<AlunoRanking[]>([])
    const [rankingEquipas, setRankingEquipas] = useState<EquipaRanking[]>([])

    // Estados para seleção de projeto
    const [projetos, setProjetos] = useState<ProjetoSimple[]>([])
    const [selectedProjetoId, setSelectedProjetoId] = useState<string>("")

    const [loading, setLoading] = useState(true)
    const [loadingEquipas, setLoadingEquipas] = useState(false)

    // Carregar Ranking Alunos + Lista de Projetos 
    useEffect(() => {
        async function fetchDataInicial() {
            try {
                setLoading(true)

                // Buscar Top Alunos Global
                const resAlunos = await api.get<AlunoRanking[]>("/api/rankings/alunos/global")
                setRankingAlunos(resAlunos.data)

                // Buscar Lista de Projetos para o Dropdown
                try {
                    const resProjetos = await api.get<ProjetoSimple[]>("/api/projetos")
                    setProjetos(resProjetos.data)
                } catch (e) {
                    console.warn("Não foi possível carregar projetos")
                }

            } catch (err) {
                console.error("Erro ao carregar dados iniciais", err)
            } finally {
                setLoading(false)
            }
        }

        fetchDataInicial()
    }, [])

    // Carregar Ranking de Equipas
    useEffect(() => {
        if (!selectedProjetoId) return

        async function fetchRankingEquipas() {
            try {
                setLoadingEquipas(true)
                const res = await api.get<EquipaRanking[]>(`/api/rankings/equipas/projeto/${selectedProjetoId}`)
                setRankingEquipas(res.data)
            } catch (err) {
                console.error("Erro ao carregar ranking equipas", err)
                setRankingEquipas([])
            } finally {
                setLoadingEquipas(false)
            }
        }

        fetchRankingEquipas()
    }, [selectedProjetoId])


    // Helper para medalhas
    function renderMedalha(index: number) {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
        if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />
        return <span className="text-gray-400 font-bold w-6 text-center">#{index + 1}</span>
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-4xl mx-auto">

                {/* CABEÇALHO */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 inline-flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-gray-900" />
                        Hall of Fame
                    </h1>
                    <p className="text-gray-500 mt-2">Os melhores desempenhos do EduScrum Awards</p>
                </div>

                {/* ABAS */}
                <Tabs defaultValue="alunos" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-[400px] grid-cols-2 bg-gray-100 p-1 rounded-lg">
                            <TabsTrigger
                                value="alunos"
                                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Top Alunos
                            </TabsTrigger>
                            <TabsTrigger
                                value="equipas"
                                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Top Equipas
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* CONTEÚDO: ALUNOS */}
                    <TabsContent value="alunos">
                        <Card className="shadow-md border-t-4 border-t-gray-900">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">A carregar rankings...</div>
                                ) : rankingAlunos.length > 0 ? (
                                    rankingAlunos.map((aluno, index) => (
                                        <div
                                            key={aluno.id}
                                            className="flex items-center p-4 border-b last:border-0 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex-shrink-0 w-12 flex justify-center">
                                                {renderMedalha(index)}
                                            </div>

                                            {/* Avatar SIMPLIFICADO*/}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 font-bold ml-4">
                                                {aluno.nome.charAt(0)}
                                            </div>

                                            <div className="ml-4 flex-grow">
                                                <p className="font-semibold text-gray-900">{aluno.nome}</p>
                                                <p className="text-xs text-gray-500">Aluno</p>
                                            </div>

                                            {/* Pontos SIMPLIFICADOS */}
                                            <div className="flex items-center gap-2 px-3 py-1">
                                                <Star className="w-4 h-4 text-gray-400 fill-current" />
                                                <span className="font-bold text-gray-900">{aluno.totalPontos} pts</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500">Sem dados de alunos.</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CONTEÚDO: EQUIPAS */}
                    <TabsContent value="equipas">
                        <Card className="shadow-md border-t-4 border-t-gray-900 min-h-[300px]">
                            <CardContent className="p-6">

                                {/* SELETOR DE PROJETO */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <LayoutList className="w-4 h-4" /> Seleciona o Projeto:
                                    </label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-gray-500 outline-none transition"
                                        value={selectedProjetoId}
                                        onChange={(e) => setSelectedProjetoId(e.target.value)}
                                    >
                                        <option value="">-- Escolhe um projeto --</option>
                                        {projetos.map(proj => (
                                            <option key={proj.id} value={proj.id}>
                                                {proj.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* TABELA DE EQUIPAS */}
                                {!selectedProjetoId ? (
                                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl border-gray-200">
                                        <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>Seleciona um projeto acima para ver quem lidera.</p>
                                    </div>
                                ) : loadingEquipas ? (
                                    <div className="text-center py-10 text-gray-500">A calcular médias...</div>
                                ) : rankingEquipas.length > 0 ? (
                                    <div className="space-y-3">
                                        {rankingEquipas.map((equipa, index) => (
                                            <div
                                                key={equipa.idEquipa}
                                                className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition relative overflow-hidden group"
                                            >
                                                {/* Barra lateral discreta */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 
                                                    ${index === 0 ? 'bg-gray-800' : 'bg-gray-300'}
                                                `}></div>

                                                <div className="flex items-center gap-4 pl-2">
                                                    <div className="w-8 flex justify-center font-bold text-gray-500">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{equipa.nomeEquipa}</h3>
                                                        <p className="text-xs text-gray-500">Total acumulado: {equipa.totalPontosMembros} pts</p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {/* Pontuação */}
                                                    <span className="block text-2xl font-bold text-gray-900">
                                                        {equipa.mediaPontos}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Média / Aluno</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">Este projeto ainda não tem equipas ou pontos.</div>
                                )}

                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>

            </div>
        </div>
    )
}