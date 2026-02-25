import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    // Redireciona para login se não estiver autenticado
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}