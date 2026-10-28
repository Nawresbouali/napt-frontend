import React, { useState } from 'react'
import api from '../api'

export default function AnalyseIA() {
  const [cve, setCve] = useState('')
  const [question, setQuestion] = useState('')
  const [reponse, setReponse] = useState('')
  const [chargement, setChargement] = useState(false)

  const analyser = async e => {
    e.preventDefault(); setChargement(true); setReponse('')
    try {
      const { data } = await api.post('/llm/analyze', {
        cve_id: cve,
        prompt: question || `Analysez ${cve} : vecteur d'attaque, impact et mesures correctives.`
      })
      setReponse(data.response)
    } catch (e) {
      setReponse('Erreur : ' + (e.response?.data?.detail || e.message))
    } finally { setChargement(false) }
  }

  return (
    <div className="ai-wrap">
      <style>{aiCss}</style>
      <div className="ai-h1">Analyse IA — Gemma</div>
      <div className="ai-sub">Évaluation et recommandations par intelligence artificielle</div>

      <div className="ai-grid">
        <div className="ai-panel">
          <h3 className="ai-pt">Analyser une CVE</h3>
          <form onSubmit={analyser}>
            <label className="ai-lbl">Identifiant CVE</label>
            <input className="ai-inp ai-mono" required placeholder="CVE-2021-44228" value={cve} onChange={e => setCve(e.target.value)} />
            <label className="ai-lbl">Question (optionnel)</label>
            <textarea className="ai-inp ai-area" rows={3} placeholder="Laisser vide pour une analyse complète…" value={question} onChange={e => setQuestion(e.target.value)} />
            <button type="submit" className="ai-go" disabled={chargement}>{chargement ? 'Analyse en cours…' : 'Analyser avec Gemma'}</button>
          </form>
          <div className="ai-model">
            <div className="ai-model-l">Modèle actif</div>
            <div className="ai-model-v">gemma 4 26B A4B (OpenRouter)</div>
            <div className="ai-model-s">Inférence cloud — OpenRouter API</div>
          </div>
        </div>

        <div className="ai-panel">
          <h3 className="ai-pt">Réponse de Gemma</h3>
          {chargement ? (
            <div className="ai-loading"><span className="ai-spin">⟳</span> Génération en cours…</div>
          ) : reponse ? (
            <div className="ai-resp">{reponse}</div>
          ) : (
            <div className="ai-empty">Entrez un identifiant CVE et cliquez sur Analyser</div>
          )}
        </div>
      </div>
    </div>
  )
}

const aiCss = `
.ai-wrap{ padding:30px 34px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.ai-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.ai-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.ai-grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:24px; }
.ai-panel{ background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:18px; padding:22px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.ai-pt{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:16px; margin-bottom:18px; }
.ai-lbl{ display:block; font-size:12.5px; font-weight:500; color:#64748b; margin:0 0 7px; }
.ai-inp{ width:100%; border:1px solid #e8ecf5; border-radius:12px; padding:11px 14px; font-size:14px; font-family:inherit; background:#fff; outline:none; margin-bottom:16px; color:#0f172a; }
.ai-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.ai-mono{ font-family:'JetBrains Mono',monospace; }
.ai-area{ resize:none; }
.ai-go{ width:100%; height:46px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; }
.ai-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.ai-go:disabled{ opacity:.6; }
.ai-model{ margin-top:16px; background:#f6f8fc; border:1px solid #e8ecf5; border-radius:12px; padding:12px 14px; }
.ai-model-l{ font-size:11.5px; color:#94a3b8; }
.ai-model-v{ font-family:'JetBrains Mono',monospace; font-size:13.5px; color:#2563eb; margin-top:2px; }
.ai-model-s{ font-size:11.5px; color:#94a3b8; margin-top:2px; }
.ai-loading{ display:flex; align-items:center; gap:10px; color:#4f46e5; font-size:14px; }
.ai-spin{ display:inline-block; animation:aispin 1s linear infinite; }
@keyframes aispin{ to{ transform:rotate(360deg); } }
.ai-resp{ font-family:'JetBrains Mono',monospace; font-size:13px; color:#334155; line-height:1.7; white-space:pre-wrap; background:#f6f8fc; border:1px solid #e8ecf5; border-radius:12px; padding:16px; max-height:420px; overflow:auto; }
.ai-empty{ text-align:center; color:#94a3b8; font-size:14px; padding:40px 0; }
`
