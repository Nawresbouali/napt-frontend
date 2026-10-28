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
    } catch (e) { setMsg({ ok: false, txt: "Erreur création" }) }
  }
  const toggleStatut = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active'
    try { await api.patch(`/users/${u.id}/status`, { status: newStatus }); load() } catch (e) {}
  }
  const changerRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    try { await api.patch(`/users/${u.id}/role`, { role: newRole }); load() } catch (e) {}
  }
  const supprimer = async (u) => {
    if (!confirm(`Supprimer ${u.username} ?`)) return
    try { await api.delete(`/users/${u.id}`); load() } catch (e) {}
  }
  const inviter = async () => {
    try {
      const r = await api.post('/invitations', { email: invEmail, role: invRole })
      setInvMsg("✅ " + r.data.message); setInvEmail("")
      setTimeout(() => { setShowInvite(false); setInvMsg("") }, 2500)
    } catch (e) { setInvMsg("❌ " + (e.response?.data?.detail || "Erreur")) }
  }

  return (
    <div className="us-wrap">
      <style>{usCss}</style>
      <div className="us-head">
        <div>
          <div className="us-h1">Utilisateurs</div>
          <div className="us-sub">Gestion des comptes</div>
        </div>
        <button className="us-add" onClick={() => setShowInvite(true)}>+ Nouvel utilisateur</button>
      </div>

      {showForm && (
        <div className="us-create">
          <h2 className="us-ct">Créer un compte</h2>
          <div className="us-grid">
            <input className="us-inp" placeholder="Nom d'utilisateur" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input className="us-inp" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="us-inp" type="password" placeholder="Mot de passe" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select className="us-inp" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="user">Utilisateur</option><option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="us-actions">
            <button className="us-btn us-btn-ok" onClick={creer}>Créer</button>
            <button className="us-btn us-btn-gray" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      {msg && <div className={"us-msg " + (msg.ok ? "us-m-ok" : "us-m-ko")}>{msg.txt}</div>}

      <div className="us-card">
        <table className="us-table">
          <thead>
            <tr><th>Nom d'utilisateur</th><th>Adresse e-mail</th><th>Rôle</th><th>Statut</th><th>Créé le</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {utilisateurs.map(u => (
              <tr key={u.id}>
                <td className="us-name">{u.username}</td>
                <td className="us-email">{u.email}</td>
                <td><span className={"us-role " + (u.role === 'admin' ? 'us-r-admin' : 'us-r-user')}>{ROLE_FR[u.role] || u.role}</span></td>
                <td><span className={u.status === 'active' ? 'us-st-on' : 'us-st-off'}>{STATUT_FR[u.status] || u.status}</span></td>
                <td className="us-date">{new Date(u.created_at).toLocaleString('fr-FR')}</td>
                <td className="us-row-act">
                  <button className="us-mini us-mini-warn" onClick={() => toggleStatut(u)} disabled={moi && u.id === moi.id}>
                    {u.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="us-mini us-mini-blue" onClick={() => changerRole(u)}>{u.role === 'admin' ? '→ User' : '→ Admin'}</button>
                  <button className="us-mini us-mini-red" onClick={() => supprimer(u)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="us-ov" onClick={() => { setShowInvite(false); setInvMsg("") }}>
          <div className="us-modal" onClick={e => e.stopPropagation()}>
            <h3 className="us-modal-t">✉️ Inviter un utilisateur</h3>
            <input className="us-inp" type="email" placeholder="Email de l'invité" value={invEmail} onChange={e => setInvEmail(e.target.value)} />
            <select className="us-inp" value={invRole} onChange={e => setInvRole(e.target.value)}>
              <option value="user">Utilisateur</option><option value="admin">Administrateur</option>
            </select>
            {invMsg && <p className="us-inv-msg">{invMsg}</p>}
            <div className="us-actions">
              <button className="us-btn us-btn-grad" onClick={inviter}>Envoyer l'invitation</button>
              <button className="us-btn us-btn-gray" onClick={() => { setShowInvite(false); setInvMsg("") }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const usCss = `
.us-wrap{ padding:30px 34px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.us-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
.us-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.us-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.us-add{ border:none; border-radius:12px; color:#fff; font-weight:600; font-size:14px; padding:11px 18px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 12px 26px -12px rgba(79,70,229,.6); transition:.3s; }
.us-add:hover{ background-position:right center; transform:translateY(-2px); }
.us-create{ background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:16px; padding:20px; margin-bottom:16px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.us-ct{ font-weight:600; font-size:16px; margin-bottom:14px; }
.us-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.us-inp{ width:100%; border:1px solid #e8ecf5; border-radius:11px; padding:10px 13px; font-size:14px; font-family:inherit; background:#fff; outline:none; color:#0f172a; }
.us-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.us-actions{ display:flex; gap:10px; margin-top:14px; }
.us-btn{ border:none; border-radius:11px; font-weight:600; font-size:14px; padding:10px 16px; cursor:pointer; }
.us-btn-ok{ background:linear-gradient(100deg,#2dd4bf,#0d9488); color:#fff; }
.us-btn-grad{ flex:1; background:linear-gradient(100deg,#6366f1,#06b6d4); color:#fff; }
.us-btn-gray{ background:#eef2f8; color:#475569; }
.us-msg{ margin-bottom:14px; padding:11px 14px; border-radius:12px; font-size:14px; }
.us-m-ok{ background:rgba(16,185,129,.12); color:#047857; } .us-m-ko{ background:rgba(244,63,94,.1); color:#e11d48; }
.us-card{ background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:16px; overflow:hidden; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.us-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
.us-table thead th{ text-align:left; padding:14px 16px; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; color:#94a3b8; border-bottom:1px solid #e8ecf5; }
.us-table tbody tr{ border-bottom:1px solid #eef2f8; }
.us-table tbody tr:hover{ background:rgba(99,102,241,.04); }
.us-table td{ padding:12px 16px; }
.us-name{ font-weight:600; }
.us-email{ color:#64748b; }
.us-role{ font-size:11.5px; padding:3px 10px; border-radius:999px; }
.us-r-admin{ background:rgba(99,102,241,.12); color:#4f46e5; } .us-r-user{ background:#eef2f8; color:#64748b; }
.us-st-on{ color:#0d9488; font-weight:600; } .us-st-off{ color:#94a3b8; }
.us-date{ color:#94a3b8; font-size:12.5px; }
.us-row-act{ display:flex; gap:7px; }
.us-mini{ font-size:11.5px; font-weight:600; padding:5px 10px; border-radius:9px; border:none; cursor:pointer; color:#fff; }
.us-mini:disabled{ opacity:.4; cursor:default; }
.us-mini-warn{ background:#f59e0b; } .us-mini-blue{ background:#6366f1; } .us-mini-red{ background:#f43f5e; }
.us-ov{ position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
.us-modal{ background:#fff; border-radius:18px; padding:24px; width:100%; max-width:400px; box-shadow:0 40px 90px -30px rgba(15,23,42,.4); display:flex; flex-direction:column; gap:12px; }
.us-modal-t{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:17px; color:#4f46e5; }
.us-inv-msg{ font-size:13.5px; }
`
