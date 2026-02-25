import { Mail, Lock, User, GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "@/services/auth"

export default function Register() {
  const navigate = useNavigate()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [papelSistema, setPapelSistema] = useState<"ALUNO" | "PROFESSOR" | "ADMIN">("ALUNO")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("As palavras-passe não coincidem.")
      return
    }

    try {
      const response = await registerUser({
        nome,
        email,
        password, 
        papelSistema,
      })

      console.log("Registo bem-sucedido:", response)
      setSuccess("Conta criada com sucesso! Redirecionando para login...")
      setError("")

      setTimeout(() => navigate("/login"), 2000)
    } catch (err: any) {
      console.error("Erro no registo:", err)
      setError(err.response?.data || "Ocorreu um erro ao registar.")
      setSuccess("")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <User className="text-white w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Criar Conta
          </CardTitle>
          <p className="text-sm text-gray-500">
            Junta-te à comunidade{" "}
            <span className="font-semibold text-indigo-600">EduScrum Awards</span>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="João Santos"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-10 text-gray-800 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-gray-800 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 text-gray-800 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirmar password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-12 text-gray-800 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Tipo de utilizador */}
            <div>
              <Label htmlFor="role">Tipo de utilizador</Label>
              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="role"
                  value={papelSistema}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setPapelSistema(e.target.value as "ALUNO" | "PROFESSOR" | "ADMIN")
                  }
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-gray-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            {/* Mensagens */}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            {/* Botão Criar Conta */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
            >
              Criar conta
            </Button>

            <p className="text-sm text-center text-gray-600">
              Já tens conta?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-sm text-gray-600 flex items-center gap-2 hover:text-indigo-600 transition">
        <ArrowLeft className="w-4 h-4" />
        <Link to="/" className="font-medium">Voltar para o site</Link>
      </div>
    </div>
  )
}