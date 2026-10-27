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
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-napt-800 border-r border-napt-700 flex flex-col">
        <div className="p-6 border-b border-napt-700">
          <div className="text-napt-accent font-bold text-xl tracking-widest">N.A.P.T</div>
          <div className="text-xs text-gray-500 mt-1">Nawres Autonomous Pentest Tool</div>
          {isAdmin && <span className="mt-2 inline-block text-xs bg-purple-900/50 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full">⚙️ Administration</span>}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {liens.map(l => (
            <NavLink key={l.vers} to={l.vers} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${isActive ? 'bg-napt-accent/10 text-napt-accent border border-napt-accent/20' : 'text-gray-400 hover:bg-napt-700 hover:text-white'}`}>
              <span>{l.icone}</span><span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-napt-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-napt-accent/20 flex items-center justify-center text-napt-accent text-sm font-bold">{user.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.username}</div>
              <div className="text-xs text-napt-accent">{isAdmin ? 'Administrateur' : 'Utilisateur'}</div>
            </div>
            <button onClick={deconnexion} title="Déconnexion" className="text-gray-500 hover:text-red-400 text-lg">⏻</button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-napt-900"><Outlet /></main>
    </div>
  )
}
