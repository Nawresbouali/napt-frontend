import React, { useState } from 'react'
import api from '../api'

const SEV_FR  = { critical:'Critique', high:'Élevée', medium:'Moyenne', low:'Faible' }
const SEV_CLS = { critical:'rc-c', high:'rc-h', medium:'rc-m', low:'rc-l' }

export default function RechercheCVE() {
  const [requete, setRequete] = useState('')
  const [resultats, setResultats] = useState([])
  const [chargement, setChargement] = useState(false)

  const rechercher = async e => {
    e.preventDefault(); setChargement(true)
    try {
      const { data } = await api.post('/rag/search', { query: requete, limit: 5 })
      setResultats(data.results)
    } catch { alert('Erreur RAG') }
    finally { setChargement(false) }
  }

  return (
    <div className="rc-wrap">
      <style>{rcCss}</style>
      <div className="rc-h1">Recherche CVE — RAG</div>
      <div className="rc-sub">Recherche sémantique — all-mpnet-base-v2 (768 dimensions)</div>

      <form onSubmit={rechercher} className="rc-form">
        <input className="rc-inp" required placeholder="Ex : exécution de code à distance Apache Tomcat, escalade de privilèges Linux…"
          value={requete} onChange={e => setRequete(e.target.value)} />
        <button type="submit" className="rc-go" disabled={chargement}>{chargement ? '…' : 'Rechercher'}</button>
      </form>

      <div className="rc-list">
        {resultats.map((r, i) => (
          <div className="rc-card" key={i}>
            <div className="rc-top">
              <div className="rc-left">
                <span className="rc-cve">{r.cve_id}</span>
                <span className={'rc-sev ' + (SEV_CLS[r.severity] || 'rc-u')}>{SEV_FR[r.severity] || r.severity}</span>
                <span className="rc-cvss">CVSS {r.cvss}</span>
              </div>
              <div className="rc-sim">
                <div className="rc-sim-l">Similarité</div>
                <div className="rc-sim-v">{(r.score * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="rc-prod">{r.product}</div>
            <div className="rc-text">{r.text?.split('|').slice(-1)[0]?.trim()}</div>
            <span className="rc-cat">{r.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const rcCss = `
.rc-wrap{ padding:30px 34px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.rc-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.rc-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.rc-form{ display:flex; gap:12px; margin:22px 0; }
.rc-inp{ flex:1; height:50px; border:1px solid #e8ecf5; border-radius:14px; padding:0 18px; font-size:15px; outline:none; background:rgba(255,255,255,.85); backdrop-filter:blur(8px); color:#0f172a; }
.rc-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.rc-go{ height:50px; padding:0 26px; border:none; border-radius:14px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; }
.rc-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.rc-go:disabled{ opacity:.6; }
.rc-list{ display:flex; flex-direction:column; gap:12px; }
.rc-card{ background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:16px; padding:18px 20px; box-shadow:0 14px 34px -26px rgba(79,70,229,.3); transition:.25s; animation:rcrise .5s both; }
.rc-card:hover{ transform:translateY(-3px); border-color:rgba(99,102,241,.35); box-shadow:0 22px 44px -22px rgba(79,70,229,.4); }
@keyframes rcrise{ from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.rc-top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
.rc-left{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.rc-cve{ font-family:'JetBrains Mono',monospace; font-weight:700; color:#4f46e5; }
.rc-sev{ font-size:11.5px; font-weight:600; padding:3px 10px; border-radius:999px; }
.rc-c{ background:rgba(244,63,94,.12); color:#e11d48; } .rc-h{ background:rgba(245,158,11,.14); color:#b45309; }
.rc-m{ background:rgba(99,102,241,.12); color:#4f46e5; } .rc-l{ background:rgba(16,185,129,.14); color:#047857; } .rc-u{ background:#eef2f8; color:#64748b; }
.rc-cvss{ font-size:12.5px; color:#64748b; }
.rc-sim{ text-align:right; }
.rc-sim-l{ font-size:11px; color:#94a3b8; }
.rc-sim-v{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; color:#0d9488; }
.rc-prod{ font-size:14px; font-weight:600; margin-bottom:3px; }
.rc-text{ font-size:13.5px; color:#64748b; line-height:1.6; }
.rc-cat{ display:inline-block; margin-top:10px; font-size:11px; background:#eef2f8; color:#64748b; padding:3px 10px; border-radius:999px; }
`
