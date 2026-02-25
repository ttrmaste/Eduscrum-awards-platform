import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Perfil from "./pages/Perfil"
import Sobre from "./pages/Sobre"
import AdminDashboard from "./pages/AdminDashboard"
import ProfessorDashboard from "./pages/ProfessorDashboard"
import AlunoCursos from "./pages/AlunoCursos"
import AdminGestaoUtilizadores from "./pages/AdminGestaoUtilizadores"
import ProfessorCursos from "./pages/ProfessorCursos"
import ProfessorCursoDetalhes from "./pages/ProfessorCursoDetalhes"
import ProjetoEquipas from "./pages/ProjetoEquipas"
import EquipaMembros from "./pages/EquipaMembros"
import "./index.css"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import AlunoCursoDetalhes from "./pages/AlunoCursoDetalhes"
import DisciplinaDetalhes from "./pages/DisciplinaDetalhes"
import Sprints from "./pages/Sprints"
import Premios from "./pages/Premios"
import Rankings from "./pages/Rankings"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Layout com Navbar + Footer */}
          <Route path="/" element={<App />}>
            {/* Página inicial */}
            <Route index element={<Home />} />

            {/* Dashboard do ALUNO */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Dashboard do PROFESSOR */}
            <Route
              path="professor/dashboard"
              element={
                <ProtectedRoute>
                  <ProfessorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Dashboard do ADMIN */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Perfil (qualquer utilizador autenticado) */}
            <Route
              path="perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />

            {/* Página dos Cursos do Aluno */}
            <Route
              path="aluno/cursos"
              element={
                <ProtectedRoute>
                  <AlunoCursos />
                </ProtectedRoute>
              }
            />

            {/* Página dos Cursos do Professor */}
            <Route
              path="professor/cursos"
              element={
                <ProtectedRoute>
                  <ProfessorCursos />
                </ProtectedRoute>
              }
            />


            {/* Página de Gestão de Utilizadores do Admin */}
            <Route
              path="admin/gestao"
              element={
                <ProtectedRoute>
                  <AdminGestaoUtilizadores />
                </ProtectedRoute>
              }
            />

            {/* Aluno - Detalhes do Curso */}
            <Route
              path="aluno/cursos/:cursoId"
              element={
                <ProtectedRoute>
                  <AlunoCursoDetalhes />
                </ProtectedRoute>
              }
            />

            {/* Professor - Detalhes do Curso */}
            <Route
              path="professor/cursos/:cursoId"
              element={
                <ProtectedRoute>
                  <ProfessorCursoDetalhes />
                </ProtectedRoute>
              }
            />

            {/* Página de Detalhes da Disciplina */}
            <Route
              path="disciplinas/:disciplinaId"
              element={
                <ProtectedRoute>
                  <DisciplinaDetalhes />
                </ProtectedRoute>
              }
            />

            {/* Página de Equipas do Projeto */}
            <Route
              path="/projetos/:projetoId/equipas"
              element={
                <ProtectedRoute>
                  <ProjetoEquipas />
                </ProtectedRoute>
              }
            />

            {/* Página de Membros da Equipa */}
            <Route
              path="/projetos/:projetoId/equipas/:equipaId/membros"
              element={
                <ProtectedRoute>
                  <EquipaMembros />
                </ProtectedRoute>
              }
            />

            {/* Página de Sprints do Projeto */}
            <Route
              path="/projetos/:projetoId/sprints"
              element={
                <ProtectedRoute>
                  <Sprints />
                </ProtectedRoute>
              }
            />

            <Route
              path="/disciplinas/:disciplinaId/premios"
              element={
                <ProtectedRoute>
                  <Premios />
                </ProtectedRoute>
              }
            />

            {/* Página de Rankings */}
            <Route
              path="rankings"
              element={
                <ProtectedRoute>
                  <Rankings />
                </ProtectedRoute>
              }
            />

            {/* Página Sobre (pública) */}
            <Route path="sobre" element={<Sobre />} />
          </Route>

          {/* Páginas sem Navbar/Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
