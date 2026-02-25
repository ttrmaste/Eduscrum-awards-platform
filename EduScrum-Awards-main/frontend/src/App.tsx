import { Outlet, useLocation } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function App() {
  const location = useLocation()

  // Páginas onde não queremos mostrar Navbar e Footer
  const hideLayout = ["/login", "/register"].includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      {/* Navbar fixa no topo */}
      {!hideLayout && <Navbar />}

      {/* Conteúdo principal */}
      <main className={`flex-grow ${hideLayout ? "" : "pt-20 "}`}>
        <Outlet />
      </main>

      {/* Footer */}
      {!hideLayout && <Footer />}
    </div>

  )

}
