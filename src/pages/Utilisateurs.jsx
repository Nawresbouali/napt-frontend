import React, { useEffect, useState } from 'react'
import api from '../api'

const ROLE_FR   = { admin: 'Administrateur', user: 'Utilisateur' }
const STATUT_FR = { active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu' }

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [moi, setMoi] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' })
  const [msg, setMsg] = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [invEmail, setInvEmail] = useState("")
  const [invRole, setInvRole] = useState("user")
  const [invMsg, setInvMsg] = useState("")

  const load = () => api.get('/users').then(r => setUtilisateurs(r.data)).catch(() => {})
  useEffect(() => { load(); api.get('/users/me').then(r => setMoi(r.data)).catch(() => {}) }, [])

  const creer = async () => {
    try {
      await api.post('/users', form)
      setMsg({ ok: true, txt: 'Utilisateur créé !' })
      setShowForm(false)
      setForm({ username: '', email: '', password: '', role: 'user' })
      load()
    } catch(e) { setMsg({ ok: false, txt: "Erreur création" }) }
  }

  const toggleStatut = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active'
    try { await api.patch(`/users/${u.id}/status`, { status: newStatus }); load() } catch(e) {}
  }

  const changerRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    try { await api.patch(`/users/${u.id}/role`, { role: newRole }); load() } catch(e) {}
  }

  const supprimer = async (u) => {
    if (!confirm(`Supprimer ${u.username} ?`)) return
    try { await api.delete(`/users/${u.id}`); load() } catch(e) {}
  }

  const inviter = async () => {
    try {
      const r = await api.post('/invitations', { email: invEmail, role: invRole })
      setInvMsg("✅ " + r.data.message)
      setInvEmail("")
      setTimeout(() => { setShowInvite(false); setInvMsg("") }, 2500)
    } catch(e) {
      setInvMsg("❌ " + (e.response?.data?.detail || "Erreur"))
    }
  }

  return (
    <>
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des comptes</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="text-white font-semibold">Créer un compte</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nom d'utilisateur" value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Mot de passe" type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={creer} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Créer</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.ok ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {msg.txt}
        </div>
      )}

      <div className="bg-napt-800 rounded-xl border border-napt-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-napt-700">
            <tr className="text-xs text-gray-500">
              <th className="px-4 py-3 text-left">Nom d'utilisateur</th>
              <th className="px-4 py-3 text-left">Adresse e-mail</th>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Date de création</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map(u => (
              <tr key={u.id} className="border-b border-napt-700/50 hover:bg-napt-700/30">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-napt-accent/10 text-napt-accent' : 'bg-napt-700 text-gray-400'}`}>
                    {ROLE_FR[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${u.status === 'active' ? 'text-napt-green' : 'text-gray-500'}`}>
                    {STATUT_FR[u.status] || u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => toggleStatut(u)} disabled={moi && u.id === moi.id}
                    className={`text-xs px-2 py-1 rounded ${u.status === 'active' ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-green-700 hover:bg-green-600'} text-white`}>
                    {u.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button onClick={() => changerRole(u)}
                    className="text-xs px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white">
                    {u.role === 'admin' ? '→ User' : '→ Admin'}
                  </button>
                  <button onClick={() => supprimer(u)}
                    className="text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sky-400 font-bold text-lg mb-4">✉️ Inviter un utilisateur</h3>
            <div className="space-y-3">
              <input type="email" placeholder="Email de l'invité" value={invEmail}
                onChange={e => setInvEmail(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded px-3 py-2 text-sm text-slate-100" />
              <select value={invRole} onChange={e => setInvRole(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded px-3 py-2 text-sm text-slate-100">
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
              {invMsg && <p className="text-sm py-1">{invMsg}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={inviter}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-2 rounded text-sm font-medium">
                  Envoyer l'invitation
                </button>
                <button onClick={() => { setShowInvite(false); setInvMsg("") }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
