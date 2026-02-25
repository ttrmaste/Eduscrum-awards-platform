import api from "@/lib/api"

// Tipo do utilizador
export type User = {
  id: number
  nome: string
  email: string
  papelSistema: "ALUNO" | "PROFESSOR" | "ADMIN"
}

// Tipos para login e registo
type LoginPayload = { email: string; password: string }
type RegisterPayload = {
  nome: string
  email: string
  password: string
  papelSistema: "ALUNO" | "PROFESSOR" | "ADMIN"
}

// Resposta do backend (LOGIN + REGISTER)
export type AuthResponse = {
  token: string
  id: number
  nome: string
  email: string
  papelSistema: "ALUNO" | "PROFESSOR" | "ADMIN"
}

// LOGIN
export async function login(data: LoginPayload) {
  const res = await api.post<AuthResponse>("/api/auth/login", data)
  return res.data
}

// REGISTO
export async function registerUser(data: RegisterPayload) {
  const payload = {
    nome: data.nome,
    email: data.email,
    password: data.password,
    papelSistema: data.papelSistema.toUpperCase(),
  }

  const res = await api.post<AuthResponse>("/api/auth/register", payload)
  return res.data
}

// Obter utilizador autenticado do backend
export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get<User>("/api/utilizadores/me")
  return res.data
}

// GESTÃO DE SESSÃO LOCAL
export function saveSession(response: AuthResponse) {
  localStorage.setItem("auth_token", response.token)

  const user: User = {
    id: response.id,
    nome: response.nome,
    email: response.email,
    papelSistema: response.papelSistema,
  }

  localStorage.setItem("user", JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user")
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("user")
  return raw ? (JSON.parse(raw) as User) : null
}
