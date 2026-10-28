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
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.detail || 'Erreur' }) }
    setLoading(false)
  }

  return (
    <div className="pf-wrap">
      <style>{pfCss}</style>
      <div className="pf-h1">Mon Profil</div>
      <div className="pf-sub">Gérez vos informations personnelles</div>

      <div className="pf-card">
        <div className="pf-user">
          <div className="pf-ava">{user.username?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="pf-name">{user.username}</div>
            <div className="pf-email">{user.email}</div>
            <span className={"pf-role " + (user.role === 'admin' ? 'pf-r-admin' : 'pf-r-user')}>
              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
        </div>
        <div className="pf-grid">
          {[['Nom d\'utilisateur', user.username], ['Email', user.email || '—'], ['Rôle', user.role], ['Statut', 'Actif']].map(([k, v]) => (
            <div className="pf-kv" key={k}><div className="pf-k">{k}</div><div className="pf-v">{v}</div></div>
          ))}
        </div>
      </div>

      <div className="pf-card">
        <h2 className="pf-ct">Changer le mot de passe</h2>
        <form onSubmit={changerPwd}>
          {[['Mot de passe actuel', ancienPwd, setAncienPwd], ['Nouveau mot de passe', nouveauPwd, setNouveauPwd], ['Confirmer', confirmPwd, setConfirmPwd]].map(([label, val, setter]) => (
            <div key={label} className="pf-field">
              <label className="pf-lbl">{label}</label>
              <input className="pf-inp" type="password" value={val} onChange={e => setter(e.target.value)} required />
            </div>
          ))}
          {msg && <div className={"pf-msg " + (msg.type === 'success' ? 'pf-ok' : 'pf-ko')}>{msg.text}</div>}
          <button type="submit" className="pf-go" disabled={loading}>{loading ? 'Modification…' : 'Modifier le mot de passe'}</button>
        </form>
      </div>
    </div>
  )
}

const pfCss = `
.pf-wrap{ padding:30px 34px; max-width:720px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.pf-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.pf-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.pf-card{ margin-top:18px; background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:18px; padding:22px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.pf-user{ display:flex; align-items:center; gap:16px; margin-bottom:20px; }
.pf-ava{ width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#06b6d4); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:24px; }
.pf-name{ font-weight:600; font-size:18px; }
.pf-email{ color:#64748b; font-size:13.5px; }
.pf-role{ display:inline-block; margin-top:6px; font-size:11.5px; padding:3px 11px; border-radius:999px; }
.pf-r-admin{ background:rgba(99,102,241,.12); color:#4f46e5; } .pf-r-user{ background:rgba(6,182,212,.12); color:#0891b2; }
.pf-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pf-kv{ background:#f6f8fc; border:1px solid #e8ecf5; border-radius:12px; padding:13px 15px; }
.pf-k{ font-size:11.5px; color:#94a3b8; margin-bottom:3px; }
.pf-v{ font-size:14px; font-weight:500; }
.pf-ct{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:16px; margin-bottom:16px; }
.pf-field{ margin-bottom:14px; }
.pf-lbl{ display:block; font-size:12.5px; color:#64748b; margin-bottom:6px; }
.pf-inp{ width:100%; border:1px solid #e8ecf5; border-radius:11px; padding:11px 14px; font-size:14px; background:#fff; outline:none; color:#0f172a; }
.pf-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.pf-msg{ padding:10px 14px; border-radius:11px; font-size:13.5px; margin-bottom:14px; }
.pf-ok{ background:rgba(16,185,129,.12); color:#047857; } .pf-ko{ background:rgba(244,63,94,.1); color:#e11d48; }
.pf-go{ width:100%; height:46px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; }
.pf-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.pf-go:disabled{ opacity:.6; }
`
