import React, { useEffect, useState } from 'react'
import api from '../api'

export default function TableauDeBord() {
  const [stats, setStats] = useState(null)
  const [rag,   setRag]   = useState(null)

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/rag/stats').then(r => setRag(r.data)).catch(() => {})
  }, [])

  const sev = [
    { nom: 'Critique', valeur: stats?.severity?.critical || 0, cls: 'db-bc1' },
    { nom: 'Élevée',   valeur: stats?.severity?.high     || 0, cls: 'db-bc2' },
    { nom: 'Moyenne',  valeur: stats?.severity?.medium   || 0, cls: 'db-bc3' },
    { nom: 'Faible',   valeur: stats?.severity?.low      || 0, cls: 'db-bc4' },
  ]
  const maxSev = Math.max(...sev.map(s => s.valeur), 1)

  const cartes = [
    { label: 'Total Scans',    valeur: stats?.total_scans ?? '—', ic: 'db-cyan',   svg: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.3-4.3" /> },
    { label: 'CVEs Détectées', valeur: stats?.total_cves  ?? '—', ic: 'db-red',    svg: <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" /> },
    { label: 'Vecteurs RAG',   valeur: rag?.vectors_count ?? '—', ic: 'db-violet', grad: true, svg: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></> },
    { label: 'Utilisateurs',   valeur: stats?.total_users ?? '—', ic: 'db-teal',   svg: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  ]

  const ragRows = rag ? [
    ['Modèle',    rag.model],
    ['Dimension', rag.dimension + ' dim'],
    ['Distance',  rag.distance],
    ['Vecteurs',  rag.vectors_count],
  ] : []

  return (
    <div className="db-wrap">
      <style>{dbCss}</style>

      <div className="db-h1">Tableau de bord</div>
      <div className="db-sub">Vue d'ensemble — N.A.P.T v2.0</div>

      <div className="db-stats">
        {cartes.map((c, i) => (
          <div className="db-stat" style={{ animationDelay: `${i * 0.07}s` }} key={c.label}>
            <div className="db-stat-top">
              <span className="db-stat-lbl">{c.label}</span>
              <span className={'db-stat-ic ' + c.ic}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{c.svg}</svg>
              </span>
            </div>
            <div className={'db-stat-val' + (c.grad ? ' db-g' : '')}>{c.valeur}</div>
          </div>
        ))}
      </div>

      <div className="db-row">
        <div className="db-panel">
          <h3 className="db-pt">Répartition par sévérité</h3>
          <div className="db-bars">
            {sev.map(s => (
              <div className="db-bw" key={s.nom}>
                <div className="db-bval">{s.valeur}</div>
                <div className={'db-bar ' + s.cls} style={{ height: `${Math.max(Math.round(s.valeur / maxSev * 100), 4)}%` }} />
                <span className="db-blbl">{s.nom}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="db-panel">
          <h3 className="db-pt">Système RAG — Qdrant</h3>
          {rag ? (
            <>
              {ragRows.map(([k, v]) => (
                <div className="db-kv" key={k}><span className="db-k">{k}</span><span className="db-v">{v}</span></div>
              ))}
              <div className="db-kv"><span className="db-k">Statut</span>
                <span className="db-ok"><span className="db-d" />{String(rag.status).toLowerCase() === 'green' ? 'Opérationnel' : rag.status}</span>
              </div>
            </>
          ) : <div className="db-load">Chargement…</div>}
        </div>
      </div>
    </div>
  )
}

const dbCss = `
.db-wrap{ padding:30px 34px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.db-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.db-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.db-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin:26px 0; }
.db-stat{ background:rgba(255,255,255,.8); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:18px; padding:20px; box-shadow:0 14px 34px -22px rgba(79,70,229,.3); transition:.3s; animation:dbrise .7s both; }
.db-stat:hover{ transform:translateY(-4px); box-shadow:0 22px 44px -20px rgba(79,70,229,.4); }
@keyframes dbrise{ from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
.db-stat-top{ display:flex; justify-content:space-between; align-items:center; }
.db-stat-lbl{ font-size:13px; color:#64748b; }
.db-stat-ic{ width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; color:#fff; }
.db-stat-ic svg{ width:19px; height:19px; }
.db-cyan{ background:linear-gradient(135deg,#06b6d4,#0891b2); }
.db-red{ background:linear-gradient(135deg,#f43f5e,#e11d48); }
.db-violet{ background:linear-gradient(135deg,#a78bfa,#6366f1); }
.db-teal{ background:linear-gradient(135deg,#2dd4bf,#0d9488); }
.db-stat-val{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:34px; margin-top:12px; }
.db-g{ background:linear-gradient(100deg,#6366f1,#06b6d4); -webkit-background-clip:text; background-clip:text; color:transparent; }
.db-row{ display:grid; grid-template-columns:1.3fr 1fr; gap:16px; }
.db-panel{ background:rgba(255,255,255,.8); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:18px; padding:22px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); animation:dbrise .8s .2s both; }
.db-pt{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:16px; margin-bottom:20px; color:#0f172a; }
.db-bars{ display:flex; align-items:flex-end; gap:24px; height:180px; padding:0 8px; }
.db-bw{ flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end; }
.db-bval{ font-size:13px; font-weight:600; color:#0f172a; }
.db-bar{ width:100%; max-width:56px; border-radius:10px 10px 4px 4px; animation:dbgrow 1s cubic-bezier(.16,1,.3,1) both; }
@keyframes dbgrow{ from{height:0 !important} }
.db-blbl{ font-size:12.5px; color:#64748b; }
.db-bc1{ background:linear-gradient(180deg,#fb7185,#e11d48); }
.db-bc2{ background:linear-gradient(180deg,#fbbf24,#d97706); }
.db-bc3{ background:linear-gradient(180deg,#6366f1,#4f46e5); }
.db-bc4{ background:linear-gradient(180deg,#2dd4bf,#0d9488); }
.db-kv{ display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #e8ecf5; font-size:13.5px; }
.db-kv:last-child{ border-bottom:none; }
.db-k{ color:#64748b; }
.db-v{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; color:#6366f1; }
.db-ok{ display:inline-flex; align-items:center; gap:6px; color:#0d9488; font-weight:600; }
.db-d{ width:8px; height:8px; border-radius:50%; background:#2dd4bf; animation:dbpulse 2s infinite; }
@keyframes dbpulse{ 0%{box-shadow:0 0 0 0 rgba(45,212,191,.5)} 70%{box-shadow:0 0 0 8px rgba(45,212,191,0)} 100%{box-shadow:0 0 0 0 rgba(45,212,191,0)} }
.db-load{ color:#94a3b8; font-size:14px; }
`
