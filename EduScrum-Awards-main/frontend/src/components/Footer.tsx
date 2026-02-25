export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Sobre */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            EduScrum Awards
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Plataforma gamificada para tornar o ensino-aprendizagem mais dinâmico,
            motivador e envolvente.
          </p>
        </div>

        {/* Links Rápidos */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Links Rápidos</h3>
          <ul className="space-y-2">
            <li className="hover:text-violet-400 transition">Home</li>
            <li className="hover:text-violet-400 transition">Sobre o Projeto</li>
            <li className="hover:text-violet-400 transition">Como Funciona</li>
            <li className="hover:text-violet-400 transition">Rankings</li>
          </ul>
        </div>

        {/* Recursos */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recursos</h3>
          <ul className="space-y-2">
            <li className="hover:text-violet-400 transition">Para Alunos</li>
            <li className="hover:text-violet-400 transition">Para Professores</li>
            <li className="hover:text-violet-400 transition">Prémios e Conquistas</li>
            <li className="hover:text-violet-400 transition">Ajuda e Suporte</li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
          <ul className="space-y-2 text-gray-400">
            <li>eduscrum@escola.pt</li>
            <li>Lisboa, Portugal</li>
          </ul>
        </div>

      </div>

      {/* Linha inferior */}
      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-500 text-sm">
        © 2025 EduScrum Awards. Todos os direitos reservados.
      </div>
    </footer>

  )
}