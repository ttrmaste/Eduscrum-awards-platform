import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [, forceUpdate] = useState(0)
  useEffect(() => {
    forceUpdate(prev => prev + 1)
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isAdmin = user?.papelSistema === "ADMIN"
  const isProfessor = user?.papelSistema === "PROFESSOR"
  const isAluno = user?.papelSistema === "ALUNO"

  // Caminho do Dashboard dinamicamente
  const dashboardPath =
    isAdmin ? "/admin/dashboard"
      : isProfessor ? "/professor/dashboard"
        : "/dashboard"

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
        >
          EduScrum Awards
        </Link>

        {/* Navegação */}
        <div className="flex items-center gap-6 text-gray-700">

          {!isAuthenticated ? (
            // NÃO autenticado
            <>
              <Link to="/" className="hover:text-violet-600 transition font-medium">
                Home
              </Link>
              <Link to="/sobre" className="hover:text-violet-600 transition font-medium">
                Sobre
              </Link>
              <Link
                to="/login"
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Entrar
              </Link>
            </>
          ) : (
            // AUTENTICADO
            <>
              <Link to="/" className="hover:text-violet-600 transition font-medium">
                Home
              </Link>

              {/* LINK DASHBOARD para todos */}
              <Link to={dashboardPath} className="hover:text-violet-600 transition font-medium">
                Dashboard
              </Link>

              {/* LINK RANKINGS para todos */}
              <Link to="/rankings" className="hover:text-violet-600 transition font-medium">
                Rankings
              </Link>

              {isAdmin && (
                <Link to="/admin/gestao" className="hover:text-violet-600 transition font-medium">
                  Gestão
                </Link>
              )}


              {isProfessor && (
                <>
                  <Link to="/professor/cursos" className="hover:text-violet-600 transition font-medium">
                    Cursos
                  </Link>
                </>
              )}

              {isAluno && (
                <>
                  <Link to="/aluno/cursos" className="hover:text-violet-600 transition font-medium">
                    Cursos
                  </Link>
                </>
              )}

              <Link to="/perfil" className="hover:text-violet-600 transition font-medium">
                Perfil
              </Link>
              <Link to="/sobre" className="hover:text-violet-600 transition font-medium">
                Sobre
              </Link>

              <button
                onClick={handleLogout}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm transition font-medium"
              >
                Logout
              </button>

              <span className="text-sm text-gray-600">
                <span className="font-medium text-violet-600">{user?.nome?.split(" ")[0]}</span>
                <span className="text-xs ml-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                  {isAdmin ? "Admin" : isProfessor ? "Professor" : "Aluno"}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
