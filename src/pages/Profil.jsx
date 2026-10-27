import { useState } from "react"
import api from "../api"

export default function Profil() {
  const user = JSON.parse(localStorage.getItem('napt_user') || '{}')
  const [ancienPwd, setAncienPwd] = useState("")
  const [nouveauPwd, setNouveauPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const changerPwd = async (e) => {
    e.preventDefault()
    if (nouveauPwd !== confirmPwd) { setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' }); return }
    if (nouveauPwd.length < 6) { setMsg({ type: 'error', text: 'Min 6 caractères' }); return }
    setLoading(true)
    try {
      await api.post('/users/change-password', { old_password: ancienPwd, new_password: nouveauPwd })
      setMsg({ type: 'success', text: 'Mot de passe modifié !' })
      setAncienPwd(""); setNouveauPwd(""); setConfirmPwd("")
    } catch(e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Erreur' })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Mon Profil</h1>
      <p className="text-gray-400 text-sm mb-8">Gérez vos informations personnelles</p>

      <div className="bg-[#1e293b] rounded-xl p-6 mb-6 border border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-2xl font-bold border-2 border-sky-500/30">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{user.username}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-sky-900/50 text-sky-300 border border-sky-700'}`}>
              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['Nom d utilisateur', user.username], ['Email', user.email || '-'], ['Role', user.role], ['Statut', 'Actif']].map(([k,v]) => (
            <div key={k} className="bg-[#0f172a] rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">{k}</div>
              <div className="text-white text-sm font-medium">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
        <h2 className="text-white font-semibold mb-4">Changer le mot de passe</h2>
        <form onSubmit={changerPwd} className="space-y-4">
          {[['Mot de passe actuel', ancienPwd, setAncienPwd], ['Nouveau mot de passe', nouveauPwd, setNouveauPwd], ['Confirmer', confirmPwd, setConfirmPwd]].map(([label, val, setter]) => (
            <div key={label}>
              <label className="block text-xs text-gray-400 mb-1">{label}</label>
              <input type="password" value={val} onChange={e => setter(e.target.value)} required
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
            </div>
          ))}
          {msg && <div className={`text-sm px-3 py-2 rounded-lg ${msg.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{msg.text}</div>}
          <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition">
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
