import { Link } from "react-router-dom"
import { Award, Users, TrendingUp, CheckCircle, Trophy, Target, Zap, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <div className="flex flex-col min-h-screen">

        {/* WRAPPER PARA O CONTEÚDO SUPERIOR */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

          {/* HERO SECTION */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="max-w-7xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Gamificação Educativa
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transforma Projetos Scrum em{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Conquistas
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                Plataforma de gamificação para gerir equipas Scrum, premiar desempenhos
                e motivar alunos e professores no ensino superior.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    Ir para Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
                    >
                      Começar Agora
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                    >
                      Já tenho conta
                    </Link>
                  </>
                )}
              </div>

              {/* Stats - Números em Preto */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">500+</h3>
                  <div className="text-sm text-gray-600 mt-1">Alunos Ativos</div>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">50+</h3>
                  <div className="text-sm text-gray-600 mt-1">Professores</div>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">200+</h3>
                  <div className="text-sm text-gray-600 mt-1">Projetos</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* FUNCIONALIDADES - COR DE FUNDO ALTERADA PARA SLATE-50 */}
        <section id="funcionalidades" className="py-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Funcionalidades Principais
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tudo o que precisas para gerir e motivar equipas Scrum no ambiente educativo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Gestão de Equipas",
                  description:
                    "Cria e organiza equipas Scrum com papéis definidos (Scrum Master, Product Owner, Developer)",
                },
                {
                  icon: <Trophy className="w-8 h-8" />,
                  title: "Sistema de Prémios",
                  description:
                    "Atribui prémios manuais ou automáticos baseados em critérios de desempenho e conquistas",
                },
                {
                  icon: <TrendingUp className="w-8 h-8" />,
                  title: "Rankings e Dashboards",
                  description:
                    "Visualiza progresso individual e de equipa com gráficos e rankings em tempo real",
                },
                {
                  icon: <Target className="w-8 h-8" />,
                  title: "Gestão de Sprints",
                  description:
                    "Acompanha objetivos, prazos e métricas de progresso de cada sprint do projeto",
                },
                {
                  icon: <Award className="w-8 h-8" />,
                  title: "Pontuação Global",
                  description:
                    "Acumula pontos ao longo do curso e compara com médias da turma",
                },
                {
                  icon: <CheckCircle className="w-8 h-8" />,
                  title: "Avaliação Facilitada",
                  description:
                    "Exporta resultados para CSV/Excel e auxilia professores na avaliação final",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Como Funciona</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simples, intuitivo e eficaz em 4 passos</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: "1", title: "Regista-te", desc: "Cria a tua conta como Aluno ou Professor" },
                { num: "2", title: "Junta-te à Equipa", desc: "Entra em equipas Scrum e define o teu papel" },
                { num: "3", title: "Trabalha em Sprints", desc: "Completa tarefas e atinge objetivos" },
                { num: "4", title: "Ganha Prémios", desc: "Acumula pontos e conquistas ao longo do curso" },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        {!isAuthenticated && (
          <section className="py-20 px-4 bg-slate-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para Começar?</h2>
              <p className="text-xl mb-8 opacity-90">
                Junta-te a centenas de alunos e professores que já usam EduScrum Awards
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  )
}