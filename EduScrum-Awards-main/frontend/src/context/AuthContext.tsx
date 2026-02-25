import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { fetchCurrentUser, saveSession, clearSession, login as apiLogin } from "@/services/auth"
import type { User, AuthResponse } from "@/services/auth"

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticação ao montar
  useEffect(() => {
    const token = localStorage.getItem("auth_token")

    if (token) {
      fetchCurrentUser()
        .then(u => {
          setUser(u)
          setIsAuthenticated(true)
        })
        .catch(() => {
          clearSession()
          setUser(null)
          setIsAuthenticated(false)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    const data: AuthResponse = await apiLogin({ email, password })

    saveSession(data)

    const newUser: User = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      papelSistema: data.papelSistema,
    }

    setUser(newUser)
    setIsAuthenticated(true)
    return newUser
  }

  // Logout
  const logout = () => {
    clearSession()
    setUser(null)
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>A carregar...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
