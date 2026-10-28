import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SEV_FR = { critical:'Critique', high:'Élevée', medium:'Moyenne', low:'Faible', unknown:'Inconnue' }
const SEV_CLS = { critical:'sc-sev-c', high:'sc-sev-h', medium:'sc-sev-m', low:'sc-sev-l', unknown:'sc-sev-u' }
const STATUT_FR = { pending:'En attente', running:'En cours', done:'Terminé', completed:'Terminé', failed:'Échoué' }

export default function Scans() {
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ target: '', target_type: 'ip' })
  const [chargement, setChargement] = useState(false)

  const charger = () => api.get('/scans').then(r => setScans(r.data)).catch(() => {})
  useEffect(() => { charger(); const i = setInterval(charger, 5000); return () => clearInterval(i) }, [])

  const lancer = async e => {
    e.preventDefault(); setChargement(true)
    try {
      const r = await api.post('/scans', form)
      charger()
      if (r.data?.id) navigate(`/scans/${r.data.id}/live`)
    } catch (e) { alert(e.response?.data?.detail || 'Erreur') }
    finally { setChargement(false) }
  }

  return (
    <div className="sc-wrap">
      <style>{scCss}</style>

      <div className="sc-h1">Scans</div>
      <div className="sc-sub">Lancez et gérez vos tests d'intrusion automatisés</div>

      <div className="sc-launch">
        <form onSubmit={lancer} className="sc-form">
          <input className="sc-inp" placeholder="IP cible (ex : 172.17.0.2)" required
            value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
          <select className="sc-sel" value={form.target_type} onChange={e => setForm({ ...form, target_type: e.target.value })}>
            <option value="ip">Adresse IP</option>
            <option value="domain">Domaine</option>
            <option value="url">URL</option>
          </select>
          <button type="submit" className="sc-go" disabled={chargement}>
            {chargement ? '…' : 'Démarrer un scan'}
            {!chargement && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 3 14 9-14 9V3Z"/></svg>}
          </button>
        </form>
      </div>

      <div className="sc-card">
        <table className="sc-table">
          <thead>
            <tr><th>Cible</th><th>CVE</th><th>Sévérité</th><th>CVSS</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {scans.length === 0 ? (
              <tr><td colSpan={7} className="sc-empty">Aucun scan pour l'instant</td></tr>
            ) : scans.map(s => {
              const sev = (s.severity || 'unknown').toLowerCase()
              const st = s.status
              return (
                <tr key={s.id}>
                  <td className="sc-mono sc-link" onClick={() => setSelected(s)}>{s.target}</td>
                  <td className="sc-clk" onClick={() => setSelected(s)}>{s.cve_id || '—'}</td>
                  <td className="sc-clk" onClick={() => setSelected(s)}><span className={'sc-badge ' + (SEV_CLS[sev] || SEV_CLS.unknown)}>{SEV_FR[sev] || '—'}</span></td>
                  <td className="sc-mono sc-clk" onClick={() => setSelected(s)}>{s.cvss_score || '—'}</td>
                  <td className="sc-clk" onClick={() => setSelected(s)}>
                    <span className={'sc-st ' + (st === 'done' || st === 'completed' ? 'sc-st-ok' : st === 'running' ? 'sc-st-run' : 'sc-st-idle')}>
                      {STATUT_FR[st] || st}
                    </span>
                  </td>
                  <td className="sc-date sc-clk" onClick={() => setSelected(s)}>{new Date(s.started_at).toLocaleString('fr-FR')}</td>
                  <td>
                    {st === 'running' && <button className="sc-act sc-live" onClick={() => navigate(`/scans/${s.id}/live`)}>● Live</button>}
                    {(st === 'done' || st === 'completed') && <button className="sc-act sc-rep" onClick={() => navigate(`/scans/${s.id}/live`)}>Rapport</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="sc-ov" onClick={() => setSelected(null)}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-head">
              <h2>Détails du scan</h2>
              <button className="sc-x" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="sc-kv"><span>Cible</span><span className="sc-mono">{selected.target}</span></div>
            <div className="sc-kv"><span>CVE</span><span className="sc-mono sc-acc">{selected.cve_id || '—'}</span></div>
            <div className="sc-kv"><span>Sévérité</span><span>{SEV_FR[(selected.severity || 'unknown').toLowerCase()] || '—'}</span></div>
            <div className="sc-kv"><span>CVSS</span><span className="sc-mono">{selected.cvss_score || '—'}</span></div>
            <div className="sc-kv"><span>Statut</span><span>{STATUT_FR[selected.status] || selected.status}</span></div>
            <div className="sc-kv"><span>Date</span><span>{new Date(selected.started_at).toLocaleString('fr-FR')}</span></div>
            {selected.client_summary && (
              <div className="sc-summary">
                <div className="sc-summary-t">Analyse et recommandations</div>
                <div className="sc-summary-b">{selected.client_summary.replace(' || REMEDIATION: ', '\n\nREMEDIATION :\n')}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const scCss = `
.sc-wrap{ padding:30px 34px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.sc-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.sc-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.sc-launch{ margin:22px 0 18px; background:rgba(255,255,255,.8); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:16px; padding:14px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.sc-form{ display:flex; gap:12px; }
.sc-inp{ flex:1; height:46px; border:1px solid #e8ecf5; border-radius:12px; padding:0 16px; font-size:15px; font-family:'JetBrains Mono',monospace; outline:none; background:#fff; color:#0f172a; }
.sc-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.sc-sel{ height:46px; border:1px solid #e8ecf5; border-radius:12px; padding:0 12px; font-size:14px; background:#fff; color:#0f172a; outline:none; cursor:pointer; }
.sc-sel:focus{ border-color:#6366f1; }
.sc-go{ height:46px; padding:0 22px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; white-space:nowrap; }
.sc-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.sc-go:disabled{ opacity:.6; }
.sc-card{ background:rgba(255,255,255,.8); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:16px; overflow:hidden; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.sc-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
.sc-table thead th{ text-align:left; padding:14px 16px; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; color:#94a3b8; border-bottom:1px solid #e8ecf5; }
.sc-table tbody tr{ border-bottom:1px solid #eef2f8; transition:.15s; }
.sc-table tbody tr:hover{ background:rgba(99,102,241,.04); }
.sc-table td{ padding:13px 16px; }
.sc-clk,.sc-link{ cursor:pointer; }
.sc-mono{ font-family:'JetBrains Mono',monospace; }
.sc-link{ color:#6366f1; font-weight:500; }
.sc-acc{ color:#6366f1; }
.sc-date{ color:#94a3b8; font-size:12.5px; }
.sc-empty{ text-align:center; padding:38px; color:#94a3b8; }
.sc-badge{ font-size:11.5px; font-weight:600; padding:3px 10px; border-radius:999px; }
.sc-sev-c{ background:rgba(244,63,94,.12); color:#e11d48; }
.sc-sev-h{ background:rgba(245,158,11,.14); color:#b45309; }
.sc-sev-m{ background:rgba(99,102,241,.12); color:#4f46e5; }
.sc-sev-l{ background:rgba(16,185,129,.14); color:#047857; }
.sc-sev-u{ background:#eef2f8; color:#64748b; }
.sc-st{ font-size:12.5px; font-weight:600; }
.sc-st-ok{ color:#0d9488; }
.sc-st-run{ color:#6366f1; }
.sc-st-idle{ color:#94a3b8; }
.sc-act{ font-size:12px; font-weight:600; padding:5px 13px; border-radius:9px; cursor:pointer; border:none; }
.sc-live{ background:rgba(244,63,94,.12); color:#e11d48; }
.sc-rep{ background:rgba(99,102,241,.12); color:#4f46e5; }
.sc-ov{ position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
.sc-modal{ background:#fff; border-radius:20px; padding:26px; max-width:640px; width:100%; max-height:88vh; overflow-y:auto; box-shadow:0 40px 90px -30px rgba(15,23,42,.4); }
.sc-modal-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.sc-modal-head h2{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:20px; }
.sc-x{ background:none; border:none; font-size:26px; color:#94a3b8; cursor:pointer; line-height:1; }
.sc-x:hover{ color:#0f172a; }
.sc-kv{ display:flex; justify-content:space-between; align-items:center; padding:11px 0; border-bottom:1px solid #eef2f8; font-size:14px; }
.sc-kv>span:first-child{ color:#64748b; }
.sc-summary{ margin-top:16px; }
.sc-summary-t{ font-weight:600; font-size:13.5px; color:#0f172a; margin-bottom:8px; }
.sc-summary-b{ background:#f6f8fc; border:1px solid #e8ecf5; border-radius:12px; padding:14px; font-size:12.5px; line-height:1.7; color:#334155; white-space:pre-wrap; }
`
