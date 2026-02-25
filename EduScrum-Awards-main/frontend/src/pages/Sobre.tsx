import { Trophy, Users, BarChart3, Target } from "lucide-react"
import aboutImage from "../images/about-image.jpg"

export default function Sobre() {
  return (
    <div className="pt-24 pb-16 bg-white text-gray-800">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <h4 className="text-violet-600 font-semibold mb-2">SOBRE NÓS</h4>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-6">
            Olá, nós somos o EduScrum Awards
          </h1>
          <p className="text-gray-600 leading-relaxed mb-4">
            O <strong>EduScrum Awards</strong> é uma plataforma criada no âmbito do curso de
            Engenharia Informática da <strong>Universidade Portucalense</strong>, com o objetivo de
            apoiar professores e estudantes na avaliação de projetos desenvolvidos com a
            metodologia <strong>Scrum</strong>.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Através de dashboards interativos, pontuações e prémios personalizados,
            promovemos a <strong>motivação, colaboração e reconhecimento</strong> no processo de aprendizagem.
          </p>
        </div>

        <div className="flex-1">
          <img
            src={aboutImage}
            alt="Estudantes a colaborar em equipa"
            className="rounded-2xl shadow-lg w-full"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl shadow">
          <h2 className="text-3xl font-bold text-gray-900">10+</h2>
          <p className="text-gray-600">Projetos Scrum Avaliados</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl shadow">
          <h2 className="text-3xl font-bold text-gray-900">50+</h2>
          <p className="text-gray-600">Estudantes Participantes</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl shadow">
          <h2 className="text-3xl font-bold text-gray-900">5+</h2>
          <p className="text-gray-600">Cursos Envolvidos</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto mt-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">A Nossa Missão</h2>
        <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Democratizar a avaliação e o acompanhamento de projetos Scrum,
          tornando o processo educativo mais envolvente e transparente através da gamificação.
          O <strong>EduScrum Awards</strong> valoriza o esforço coletivo, o progresso e o mérito académico.
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto mt-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">O Que Nos Move</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow hover:shadow-lg transition">
            <Trophy className="w-10 h-10 mx-auto text-violet-600 mb-3" />
            <h3 className="font-semibold mb-2">Prémios e Reconhecimento</h3>
            <p className="text-gray-600 text-sm">
              Professores atribuem prémios e pontos por desempenho e participação ativa.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow hover:shadow-lg transition">
            <Users className="w-10 h-10 mx-auto text-violet-600 mb-3" />
            <h3 className="font-semibold mb-2">Gestão de Equipas</h3>
            <p className="text-gray-600 text-sm">
              Cada projeto é organizado em equipas Scrum com papéis e responsabilidades claras.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow hover:shadow-lg transition">
            <BarChart3 className="w-10 h-10 mx-auto text-violet-600 mb-3" />
            <h3 className="font-semibold mb-2">Dashboards e Rankings</h3>
            <p className="text-gray-600 text-sm">
              Dados visuais que mostram o progresso das equipas e dos alunos em tempo real.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow hover:shadow-lg transition">
            <Target className="w-10 h-10 mx-auto text-violet-600 mb-3" />
            <h3 className="font-semibold mb-2">Motivação e Progresso</h3>
            <p className="text-gray-600 text-sm">
              A gamificação transforma o desempenho académico em conquistas visíveis e motivadoras.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="max-w-4xl mx-auto mt-24 text-center px-6">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl shadow p-10">
          <p className="text-lg italic text-gray-700 mb-4">
            “Acreditamos que o reconhecimento é uma das formas mais poderosas de motivar e
            inspirar o sucesso académico.”
          </p>
          <p className="font-semibold text-gray-800">— Equipa EduScrum Awards</p>
        </div>
      </section>
    </div>
  )
}
