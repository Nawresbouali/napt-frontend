import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Rapports() {
  const token = localStorage.getItem('napt_token')
  const navigate = useNavigate()
  const [lang, setLang] = useState("fr")
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState(null)

  const telecharger = async () => {
    setChargement(true); setMessage(null)
    try {
      const r = await fetch(`/api/reports/generer?lang=${lang}`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.status === 401) {
        localStorage.removeItem("token")
        setMessage({ ok: false, txt: "Session expirée — reconnectez-vous." })
        setTimeout(() => navigate("/login"), 2000)
        return
      }
      if (!r.ok) { const txt = await r.text().catch(() => ""); throw new Error(`Erreur ${r.status}${txt ? " : " + txt : ""}`) }
      const blob = await r.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `napt_rapport_${lang}.pdf`
      a.click()
      setMessage({ ok: true, txt: "Rapport téléchargé !" })
    } catch (e) {
      setMessage({ ok: false, txt: "Erreur : " + e.message })
    } finally { setChargement(false) }
  }

  return (
    <div className="rp-wrap">
      <style>{rpCss}</style>
      <div className="rp-h1">Rapports PDF</div>
      <div className="rp-sub">Générez le rapport complet de vos scans</div>

      <div className="rp-card">
        <div className="rp-label">Choisir la langue</div>
        <div className="rp-langs">
          <button className={"rp-lang" + (lang === "fr" ? " rp-on" : "")} onClick={() => setLang("fr")}>Français</button>
          <button className={"rp-lang" + (lang === "en" ? " rp-on" : "")} onClick={() => setLang("en")}>English</button>
        </div>
        <button className="rp-go" onClick={telecharger} disabled={chargement}>
          {chargement ? "Génération en cours…" : "⬇ Télécharger le rapport PDF"}
        </button>
        {message && <div className={"rp-msg " + (message.ok ? "rp-ok" : "rp-ko")}>{message.txt}</div>}
      </div>
    </div>
  )
}

const rpCss = `
.rp-wrap{ padding:30px 34px; max-width:560px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.rp-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.rp-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.rp-card{ margin-top:24px; background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:18px; padding:24px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.rp-label{ font-size:14px; font-weight:500; color:#0f172a; margin-bottom:12px; }
.rp-langs{ display:flex; gap:12px; margin-bottom:20px; }
.rp-lang{ flex:1; height:48px; border:1px solid #e8ecf5; border-radius:12px; background:#fff; color:#64748b; font-weight:600; font-size:15px; cursor:pointer; transition:.25s; }
.rp-lang:hover{ border-color:rgba(99,102,241,.4); }
.rp-on{ color:#fff !important; border-color:transparent !important; background:linear-gradient(100deg,#6366f1,#06b6d4); box-shadow:0 10px 22px -10px rgba(99,102,241,.5); transform:translateY(-1px); }
.rp-go{ width:100%; height:50px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; }
.rp-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.rp-go:disabled{ opacity:.6; }
.rp-msg{ margin-top:16px; padding:12px; border-radius:12px; text-align:center; font-weight:500; font-size:14px; }
.rp-ok{ background:rgba(16,185,129,.12); color:#047857; }
.rp-ko{ background:rgba(244,63,94,.1); color:#e11d48; }
`
