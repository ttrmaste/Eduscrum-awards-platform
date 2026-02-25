import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      const user = await login(formData.email, formData.password)

      // Redirecionar consoante o papel
      if (user.papelSistema === "ADMIN") {
        navigate("/admin/dashboard", { replace: true })
      } else if (user.papelSistema === "PROFESSOR") {
        navigate("/professor/dashboard", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }

    } catch (err: any) {
      console.error(err)
      setError("Email ou password incorretos.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Lock className="text-white w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Bem-vindo de volta
          </CardTitle>
          <p className="text-sm text-gray-500">
            Entre na sua conta{" "}
            <span className="font-semibold text-indigo-600">EduScrum Awards</span>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemplo@email.com"
                  className="pl-10 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 pr-10 text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-2.5 p-1 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              Entrar
            </Button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-4">
            Não tens conta?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Regista-te
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 text-sm text-gray-600 flex items-center gap-2 hover:text-indigo-600 transition">
        <ArrowLeft className="w-4 h-4" />
        <Link to="/" className="font-medium">Voltar para o site</Link>
      </div>
    </div>
  )
}
