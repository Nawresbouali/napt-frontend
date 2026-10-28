import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const liensAdmin = [
  { vers: '/tableau-de-bord', icone: '📊', label: 'Tableau de bord' },
  { vers: '/scans',           icone: '🔍', label: 'Scans' },
  { vers: '/recherche-cve',   icone: '🛡️', label: 'Recherche CVE' },
  { vers: '/analyse-ia',      icone: '🤖', label: 'Analyse IA' },
  { vers: '/scan-reseau',     icone: '🌐', label: 'Scan Réseau' },
  { vers: '/rapports',        icone: '📄', label: 'Rapports PDF' },
  { vers: '/audit',           icone: '📋', label: 'Audit' },
  { vers: '/utilisateurs',    icone: '👥', label: 'Utilisateurs' },
  { vers: '/profil',          icone: '👤', label: 'Mon Profil' },
]
const liensUser = [
  { vers: '/tableau-de-bord', icone: '📊', label: 'Tableau de bord' },
  { vers: '/scans',           icone: '🔍', label: 'Mes Scans' },
  { vers: '/recherche-cve',   icone: '🛡️', label: 'CVE & Vulnérabilités' },
  { vers: '/analyse-ia',      icone: '🤖', label: 'Analyse IA' },
  { vers: '/scan-reseau',     icone: '🌐', label: 'Scan Réseau' },
  { vers: '/rapports',        icone: '📄', label: 'Mes Rapports' },
  { vers: '/chatbot',         icone: '💬', label: 'Assistant IA' },
  { vers: '/profil',          icone: '👤', label: 'Mon Profil' },
]

export default function Layout() {
  const nav = useNavigate()
  const user = JSON.parse(localStorage.getItem('napt_user') || '{}')
  const isAdmin = user.role === 'admin'
  const liens = isAdmin ? liensAdmin : liensUser
  const deconnexion = () => { localStorage.clear(); nav('/connexion') }

  return (
    <div className="lx-root">
      <style>{lxCss}</style>

      <div className="lx-aurora">
        <span className="lx-blob lx-b1" /><span className="lx-blob lx-b2" /><span className="lx-blob lx-b3" />
      </div>

      <aside className="lx-side">
        <div className="lx-head">
          <div className="lx-logo">N.A.P.T</div>
          <div className="lx-logo-sub">Nawres Autonomous Pentest Tool</div>
          {isAdmin && <span className="lx-pill">⚙️ Administration</span>}
        </div>

        <nav className="lx-nav-wrap">
          {liens.map(l => (
            <NavLink key={l.vers} to={l.vers}
              className={({ isActive }) => 'lx-nav' + (isActive ? ' lx-on' : '')}>
              <span className="lx-ic">{l.icone}</span><span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="lx-foot">
          <div className="lx-ava">{user.username?.[0]?.toUpperCase() || 'U'}</div>
          <div className="lx-foot-txt">
            <div className="lx-u">{user.username}</div>
            <div className="lx-r">{isAdmin ? 'Administrateur' : 'Utilisateur'}</div>
          </div>
          <button onClick={deconnexion} title="Déconnexion" className="lx-out">⏻</button>
        </div>
      </aside>

      <main className="lx-main"><Outlet /></main>
    </div>
  )
}

const lxCss = `
.lx-root{ display:flex; height:100vh; overflow:hidden; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; background:#f6f8fc; position:relative; }
.lx-aurora{ position:fixed; inset:0; overflow:hidden; z-index:0; pointer-events:none; }
.lx-blob{ position:absolute; border-radius:50%; filter:blur(85px); opacity:.30; }
.lx-b1{ width:480px; height:480px; background:#06b6d4; top:-130px; left:-60px; animation:lxf1 15s ease-in-out infinite; }
.lx-b2{ width:440px; height:440px; background:#6366f1; bottom:-150px; right:4%; animation:lxf2 17s ease-in-out infinite; }
.lx-b3{ width:360px; height:360px; background:#a78bfa; top:40%; left:46%; animation:lxf3 19s ease-in-out infinite; }
@keyframes lxf1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(50px,-36px) scale(1.12)}}
@keyframes lxf2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-56px,34px) scale(1.16)}}
@keyframes lxf3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-34px,-44px) scale(1.07)}}

.lx-side{ position:relative; z-index:1; width:250px; flex-shrink:0; display:flex; flex-direction:column;
  background:rgba(255,255,255,.72); backdrop-filter:blur(16px); border-right:1px solid #e8ecf5; }
.lx-head{ padding:24px 20px; border-bottom:1px solid #e8ecf5; }
.lx-logo{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:26px; letter-spacing:-1px;
  background:linear-gradient(100deg,#6366f1,#06b6d4 60%,#2dd4bf); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:200% auto; animation:lxshine 6s linear infinite; }
@keyframes lxshine{to{background-position:200% center}}
.lx-logo-sub{ font-size:11px; color:#64748b; margin-top:3px; }
.lx-pill{ display:inline-block; margin-top:12px; font-size:11px; font-weight:500; color:#6366f1; background:rgba(99,102,241,.1); padding:4px 11px; border-radius:999px; }
.lx-nav-wrap{ flex:1; padding:16px 14px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; }
.lx-nav{ display:flex; align-items:center; gap:11px; padding:10px 13px; border-radius:11px; font-size:13.5px; font-weight:500; color:#64748b; text-decoration:none; transition:.2s; }
.lx-nav:hover{ background:rgba(99,102,241,.06); color:#0f172a; }
.lx-on{ color:#fff !important; background:linear-gradient(100deg,#6366f1,#06b6d4); box-shadow:0 10px 22px -10px rgba(99,102,241,.6); }
.lx-ic{ font-size:15px; width:20px; text-align:center; }
.lx-foot{ padding:16px 18px; border-top:1px solid #e8ecf5; display:flex; align-items:center; gap:10px; }
.lx-ava{ width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#06b6d4); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:13px; flex-shrink:0; }
.lx-foot-txt{ flex:1; min-width:0; }
.lx-u{ font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lx-r{ font-size:11px; color:#6366f1; }
.lx-out{ background:none; border:none; cursor:pointer; color:#94a3b8; font-size:18px; transition:.2s; }
.lx-out:hover{ color:#ef4444; }
.lx-main{ position:relative; z-index:1; flex:1; overflow:auto; }
`
