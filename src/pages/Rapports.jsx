import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Rapports() {
  const token = localStorage.getItem('napt_token')
  const navigate = useNavigate()
  const [lang, setLang] = useState("fr")
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState(null)

  const telecharger = async () => {
    setChargement(true)
    setMessage(null)
    try {
      const r = await fetch(`/api/reports/generer?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (r.status === 401) {
        localStorage.removeItem("token")
        setMessage({ ok: false, txt: "Session expirée — reconnectez-vous." })
        setTimeout(() => navigate("/login"), 2000)
        return
      }

      if (!r.ok) {
        const txt = await r.text().catch(() => "")
        throw new Error(`Erreur ${r.status}${txt ? " : " + txt : ""}`)
      }

      const blob = await r.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `napt_rapport_${lang}.pdf`
      a.click()
      setMessage({ ok: true, txt: "Rapport téléchargé !" })
    } catch (e) {
      setMessage({ ok: false, txt: "Erreur : " + e.message })
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Rapports PDF</h1>
      <div className="bg-gray-800 rounded-xl p-6 shadow space-y-6">
        <div>
          <p className="text-gray-300 mb-3 font-medium">Choisir la langue</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLang("fr")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                lang === "fr"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Francais
            </button>
            <button
              onClick={() => setLang("en")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                lang === "en"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              English
            </button>
          </div>
        </div>
        <button
          onClick={telecharger}
          disabled={chargement}
          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold rounded-lg transition-all"
        >
          {chargement ? "Generation en cours..." : "Telecharger le rapport PDF"}
        </button>
        {message && (
          <div className={`p-3 rounded-lg text-center font-medium ${
            message.ok ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
          }`}>
            {message.txt}
          </div>
        )}
      </div>
    </div>
  )
}
