import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = ['Reconnaissance', 'Recherche CVE', 'Analyse IA', 'Exploitation', 'Rapport']

export default function Bienvenue() {
  const nav = useNavigate()
  const [actif, setActif] = useState(0)
  const connecte = !!localStorage.getItem('napt_token')

  useEffect(() => {
    const i = setInterval(() => setActif(a => (a + 1) % STEPS.length), 700)
    return () => clearInterval(i)
  }, [])

  const demarrer = () => nav(connecte ? '/tableau-de-bord' : '/connexion')

  return (
    <div className="bw-root">
      <style>{bwCss}</style>
      <div className="bw-aurora">
        <span className="bw-blob bw-b1" /><span className="bw-blob bw-b2" />
        <span className="bw-blob bw-b3" /><span className="bw-blob bw-b4" />
      </div>
      <div className="bw-grid" />

      <main className="bw-card">
        <div className="bw-badge"><span className="bw-dot" /> Plateforme de pentest autonome · propulsée par l'IA</div>
        <h1 className="bw-title">N.A.P.T</h1>
        <div className="bw-sub">Nawres Autonomous Pentest Tool</div>
        <p className="bw-desc">Reconnaissance, recherche de vulnérabilités, évaluation par IA et exploitation réelle — un pipeline de pentest entièrement automatisé.</p>

        <div className="bw-pipe">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={'bw-step' + (i === actif ? ' bw-on' : '')}><span className="bw-ic" />{s}</div>
              {i < STEPS.length - 1 && <span className="bw-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>

        <button className="bw-cta" onClick={demarrer}>
          {connecte ? 'Accéder au tableau de bord' : 'Démarrer un scan'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>

        <div className="bw-foot">Environnement de test isolé et autorisé · © N.A.P.T 2026</div>
      </main>
    </div>
  )
}

const bwCss = `
.bw-root{ font-family:'Inter','Segoe UI',sans-serif; background:#fff; color:#0f172a; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
.bw-aurora{ position:fixed; inset:0; overflow:hidden; z-index:0; }
.bw-blob{ position:absolute; border-radius:50%; filter:blur(70px); opacity:.45; }
.bw-b1{ width:520px; height:520px; background:#06b6d4; top:-120px; left:-80px; animation:bwf1 14s ease-in-out infinite; }
.bw-b2{ width:460px; height:460px; background:#6366f1; bottom:-140px; right:-60px; animation:bwf2 16s ease-in-out infinite; }
.bw-b3{ width:380px; height:380px; background:#a78bfa; top:40%; left:55%; animation:bwf3 18s ease-in-out infinite; }
.bw-b4{ width:320px; height:320px; background:#2dd4bf; bottom:10%; left:8%; animation:bwf1 20s ease-in-out infinite; }
@keyframes bwf1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.1)}}
@keyframes bwf2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,30px) scale(1.15)}}
@keyframes bwf3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-40px) scale(1.05)}}
.bw-grid{ position:fixed; inset:0; z-index:1; background-image:linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px); background-size:46px 46px; opacity:.4; -webkit-mask-image:radial-gradient(circle at 50% 45%,#000 35%,transparent 78%); mask-image:radial-gradient(circle at 50% 45%,#000 35%,transparent 78%); }
.bw-card{ position:relative; z-index:2; width:min(760px,92vw); text-align:center; padding:48px 40px; border-radius:28px; background:rgba(255,255,255,.72); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.9); box-shadow:0 30px 80px -20px rgba(79,70,229,.25),0 8px 24px -8px rgba(6,182,212,.18); animation:bwrise .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes bwrise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
.bw-badge{ display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:#6366f1; background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.2); padding:7px 14px; border-radius:999px; margin-bottom:26px; }
.bw-dot{ width:8px; height:8px; border-radius:50%; background:#2dd4bf; animation:bwpulse 2s infinite; }
@keyframes bwpulse{0%{box-shadow:0 0 0 0 rgba(45,212,191,.5)}70%{box-shadow:0 0 0 10px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}
.bw-title{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:72px; letter-spacing:-2px; line-height:1; background:linear-gradient(100deg,#6366f1,#06b6d4 55%,#2dd4bf); -webkit-background-clip:text; background-clip:text; color:transparent; background-size:200% auto; animation:bwshine 6s linear infinite; }
@keyframes bwshine{to{background-position:200% center}}
.bw-sub{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:500; font-size:19px; margin-top:10px; }
.bw-desc{ font-size:15px; color:#64748b; margin:14px auto 0; max-width:460px; line-height:1.6; }
.bw-pipe{ display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; margin:34px 0 32px; }
.bw-step{ display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:#64748b; background:#fff; border:1px solid #e2e8f0; padding:9px 14px; border-radius:12px; transition:.4s; }
.bw-on{ color:#6366f1; border-color:rgba(99,102,241,.4); box-shadow:0 8px 20px -8px rgba(99,102,241,.5); transform:translateY(-2px); }
.bw-ic{ width:7px; height:7px; border-radius:50%; background:#e2e8f0; transition:.4s; }
.bw-on .bw-ic{ background:#2dd4bf; box-shadow:0 0 10px #2dd4bf; }
.bw-arrow{ color:#cbd5e1; font-size:14px; }
.bw-cta{ display:inline-flex; align-items:center; gap:10px; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:16px; color:#fff; padding:15px 30px; border:none; border-radius:14px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; box-shadow:0 14px 30px -10px rgba(79,70,229,.6); transition:.35s; cursor:pointer; }
.bw-cta:hover{ background-position:right center; transform:translateY(-3px); box-shadow:0 20px 40px -10px rgba(79,70,229,.75); }
.bw-cta svg{ transition:.35s; } .bw-cta:hover svg{ transform:translateX(5px); }
.bw-foot{ margin-top:22px; font-size:12.5px; color:#94a3b8; }
`
