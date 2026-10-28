import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Connexion() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [voir, setVoir] = useState(false)
  const nav = useNavigate()

  const soumettre = async e => {
    e.preventDefault()
    setChargement(true); setErreur('')
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('napt_token', data.access_token)
      localStorage.setItem('napt_user', JSON.stringify(data.user))
      nav('/tableau-de-bord')
    } catch {
      setErreur('Identifiants incorrects')
    } finally { setChargement(false) }
  }

  return (
    <div className="nl-root">
      <style>{nlCss}</style>

      <div className="nl-aurora">
        <span className="nl-blob nl-b1" /><span className="nl-blob nl-b2" />
        <span className="nl-blob nl-b3" /><span className="nl-blob nl-b4" />
      </div>
      <div className="nl-grid" />

      <div className="nl-card">
        {/* --- Branding --- */}
        <section className="nl-brand">
          <div className="nl-badge"><span className="nl-dot" /> Pentest autonome · propulsé par l'IA</div>
          <h1 className="nl-title">N.A.P.T</h1>
          <div className="nl-sub">Nawres Autonomous Pentest Tool</div>
          <div className="nl-feat">
            <div><span className="nl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/></svg></span>Reconnaissance &amp; scan réseau automatisés</div>
            <div><span className="nl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"/></svg></span>Évaluation CVSS par IA (Gemma)</div>
            <div><span className="nl-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13 2-3 7h5l-3 7"/><path d="M12 2v20"/></svg></span>Exploitation réelle via Metasploit</div>
          </div>
        </section>

        {/* --- Formulaire --- */}
        <section className="nl-form">
          <h2 className="nl-h2">Connexion</h2>
          <p className="nl-lead">Accédez à votre tableau de bord sécurité.</p>

          <form onSubmit={soumettre}>
            <label className="nl-label" htmlFor="u">Nom d'utilisateur</label>
            <div className="nl-field">
              <svg className="nl-lead-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
              <input id="u" className="nl-input" type="text" placeholder="nawres" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>

            <label className="nl-label" htmlFor="p">Mot de passe</label>
            <div className="nl-field">
              <svg className="nl-lead-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input id="p" className="nl-input" type={voir ? 'text' : 'password'} placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="nl-eye" onClick={() => setVoir(v => !v)} aria-label="Afficher le mot de passe">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>

            {erreur && <div className="nl-err">{erreur}</div>}

            <button type="submit" className="nl-btn" disabled={chargement}>
              {chargement ? 'Connexion...' : 'Se connecter'}
              {!chargement && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
            </button>
          </form>

          <div className="nl-hint">PFE Cycle Ingénieur — Sécurité Informatique 2026</div>
        </section>
      </div>
    </div>
  )
}

const nlCss = `
.nl-root{ font-family:'Inter',system-ui,sans-serif; background:#fff; color:#0f172a; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
.nl-aurora{ position:fixed; inset:0; overflow:hidden; z-index:0; }
.nl-blob{ position:absolute; border-radius:50%; filter:blur(70px); opacity:.45; }
.nl-b1{ width:520px; height:520px; background:#06b6d4; top:-120px; left:-80px; animation:nlf1 14s ease-in-out infinite; }
.nl-b2{ width:460px; height:460px; background:#6366f1; bottom:-140px; right:-60px; animation:nlf2 16s ease-in-out infinite; }
.nl-b3{ width:380px; height:380px; background:#a78bfa; top:40%; left:52%; animation:nlf3 18s ease-in-out infinite; }
.nl-b4{ width:300px; height:300px; background:#2dd4bf; bottom:8%; left:6%; animation:nlf1 20s ease-in-out infinite; }
@keyframes nlf1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.1)}}
@keyframes nlf2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,30px) scale(1.15)}}
@keyframes nlf3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-40px) scale(1.05)}}
.nl-grid{ position:fixed; inset:0; z-index:1; background-image:linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px); background-size:46px 46px; opacity:.35; -webkit-mask-image:radial-gradient(circle at 50% 50%,#000 30%,transparent 75%); mask-image:radial-gradient(circle at 50% 50%,#000 30%,transparent 75%); }
.nl-card{ position:relative; z-index:2; width:min(920px,94vw); display:grid; grid-template-columns:1.05fr .95fr; border-radius:28px; overflow:hidden; background:rgba(255,255,255,.72); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.9); box-shadow:0 30px 80px -20px rgba(79,70,229,.25),0 8px 24px -8px rgba(6,182,212,.18); animation:nlrise .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes nlrise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
.nl-brand{ padding:54px 46px; border-right:1px solid rgba(226,232,240,.8); }
.nl-badge{ display:inline-flex; align-items:center; gap:8px; font-size:12.5px; font-weight:500; color:#6366f1; background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.2); padding:6px 13px; border-radius:999px; }
.nl-dot{ width:7px; height:7px; border-radius:50%; background:#2dd4bf; animation:nlpulse 2s infinite; }
@keyframes nlpulse{0%{box-shadow:0 0 0 0 rgba(45,212,191,.5)}70%{box-shadow:0 0 0 9px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}
.nl-title{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:58px; letter-spacing:-2px; line-height:1; margin-top:22px; background:linear-gradient(100deg,#6366f1,#06b6d4 55%,#2dd4bf); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:200% auto; animation:nlshine 6s linear infinite; }
@keyframes nlshine{to{background-position:200% center}}
.nl-sub{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:500; font-size:16px; margin-top:8px; color:#0f172a; }
.nl-feat{ margin-top:28px; display:flex; flex-direction:column; gap:14px; }
.nl-feat>div{ display:flex; align-items:center; gap:11px; font-size:14px; color:#64748b; }
.nl-ic{ width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; background:rgba(6,182,212,.1); color:#06b6d4; flex-shrink:0; }
.nl-ic svg{ width:16px; height:16px; }
.nl-form{ padding:54px 46px; display:flex; flex-direction:column; justify-content:center; }
.nl-h2{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:24px; color:#0f172a; }
.nl-lead{ font-size:14px; color:#64748b; margin-top:6px; margin-bottom:26px; }
.nl-label{ font-size:13px; font-weight:500; color:#0f172a; display:block; margin-bottom:7px; }
.nl-field{ position:relative; margin-bottom:18px; }
.nl-lead-ic{ position:absolute; left:14px; top:50%; transform:translateY(-50%); width:18px; height:18px; color:#64748b; pointer-events:none; }
.nl-input{ width:100%; height:48px; padding:0 44px; border:1px solid #e2e8f0; border-radius:13px; font-size:15px; font-family:inherit; background:#fff; transition:.25s; outline:none; color:#0f172a; }
.nl-input:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.nl-eye{ position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#64748b; padding:4px; display:flex; }
.nl-err{ color:#dc2626; font-size:13.5px; text-align:center; margin-bottom:14px; }
.nl-btn{ width:100%; height:50px; margin-top:8px; border:none; border-radius:13px; cursor:pointer; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:16px; color:#fff; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; box-shadow:0 14px 30px -10px rgba(79,70,229,.6); transition:.35s; display:flex; align-items:center; justify-content:center; gap:9px; }
.nl-btn:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); box-shadow:0 20px 40px -10px rgba(79,70,229,.75); }
.nl-btn:disabled{ opacity:.6; cursor:default; }
.nl-hint{ margin-top:20px; font-size:12.5px; color:#64748b; text-align:center; }
@media(max-width:760px){ .nl-card{ grid-template-columns:1fr; } .nl-brand{ border-right:none; border-bottom:1px solid rgba(226,232,240,.8); padding:38px; } .nl-title{font-size:46px;} .nl-form{padding:38px;} }
`
