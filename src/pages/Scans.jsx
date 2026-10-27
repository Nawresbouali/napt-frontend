import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SEV_CSS = {
  critical:'bg-red-500/10 text-red-400 border-red-500/20',
  high:'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium:'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low:'bg-green-500/10 text-green-400 border-green-500/20',
  unknown:'bg-gray-500/10 text-gray-400 border-gray-500/20'
}
const SEV_FR = { critical:'Critique', high:'Élevée', medium:'Moyenne', low:'Faible', unknown:'Inconnue' }
const STATUT_FR = { pending:'En attente', running:'En cours', done:'Terminé', failed:'Échoué' }

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
      // Redirige directement vers le live scan après lancement
      if (r.data?.id) navigate(`/scans/${r.data.id}/live`)
    }
    catch(e) { alert(e.response?.data?.detail || 'Erreur') }
    finally { setChargement(false) }
  }

  return (
    <>
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Scans</h1>
        <p className="text-gray-500 text-sm mt-1">Lancer et gérer les scans de test d'intrusion</p>
      </div>
      <div className="bg-napt-800 rounded-xl p-6 border border-napt-700 mb-6 glow">
        <h3 className="text-sm font-semibold mb-4">🚀 Nouveau Scan</h3>
        <form onSubmit={lancer} className="flex gap-3">
          <input
            className="flex-1 bg-napt-900 border border-napt-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-napt-accent"
            placeholder="IP cible (ex: 192.168.1.1)"
            value={form.target}
            onChange={e => setForm({...form, target: e.target.value})}
            required
          />
          <select
            className="bg-napt-900 border border-napt-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-napt-accent"
            value={form.target_type}
            onChange={e => setForm({...form, target_type: e.target.value})}
          >
            <option value="ip">Adresse IP</option>
            <option value="domain">Domaine</option>
            <option value="url">URL</option>
          </select>
          <button type="submit" disabled={chargement}
            className="bg-napt-accent text-napt-900 font-bold px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
            {chargement ? '...' : 'Lancer'}
          </button>
        </form>
      </div>
      <div className="bg-napt-800 rounded-xl border border-napt-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-napt-700">
            <tr className="text-xs text-gray-500">
              <th className="px-4 py-3 text-left">Cible</th>
              <th className="px-4 py-3 text-left">CVE</th>
              <th className="px-4 py-3 text-left">Sévérité</th>
              <th className="px-4 py-3 text-left">CVSS</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">Aucun scan</td></tr>
            ) : scans.map(s => {
              const sevKey = (s.severity || 'unknown').toLowerCase()
              return (
                <tr key={s.id} className="border-b border-napt-700/50 hover:bg-napt-700/30">
                  <td className="px-4 py-3 font-mono text-napt-accent cursor-pointer" onClick={() => setSelected(s)}>{s.target}</td>
                  <td className="px-4 py-3 text-gray-300 cursor-pointer" onClick={() => setSelected(s)}>{s.cve_id || '—'}</td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => setSelected(s)}>
                    <span className={`px-2 py-0.5 rounded border text-xs ${SEV_CSS[sevKey] || SEV_CSS.unknown}`}>
                      {SEV_FR[sevKey] || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono cursor-pointer" onClick={() => setSelected(s)}>{s.cvss_score || '—'}</td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => setSelected(s)}>
                    <span className={`text-xs ${s.status === 'done' ? 'text-napt-green' : s.status === 'running' ? 'text-napt-accent' : 'text-gray-400'}`}>
                      {STATUT_FR[s.status] || s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs cursor-pointer" onClick={() => setSelected(s)}>{new Date(s.started_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    {s.status === 'running' && (
                      <button
                        onClick={() => navigate(`/scans/${s.id}/live`)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border"
                        style={{ background: '#1a0a0a', border: '1px solid #dc2626', color: '#f87171' }}
                      >
                        🔴 Live
                      </button>
                    )}
                    {s.status === 'done' && (
                      <button
                        onClick={() => navigate(`/scans/${s.id}/live`)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border"
                        style={{ background: '#0a1929', border: '1px solid #0e7490', color: '#22d3ee' }}
                      >
                        📄 Rapport
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
    {selected && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
        <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Details du scan</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-2xl">x</button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Cible</span><span className="text-white font-mono">{selected.target}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">CVE</span><span className="text-blue-400 font-mono">{selected.cve_id || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Severite</span><span className="text-white">{SEV_FR[(selected.severity||"unknown").toLowerCase()] || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">CVSS</span><span className="text-white font-mono">{selected.cvss_score || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Statut</span><span className="text-white">{STATUT_FR[selected.status] || selected.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="text-white">{new Date(selected.started_at).toLocaleString("fr-FR")}</span></div>
            {selected.client_summary && (
              <div className="mt-4">
                <p className="text-gray-400 mb-2 font-semibold">Analyse et Recommandations</p>
                <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                  {selected.client_summary.replace(" || REMEDIATION: ", "\n\nREMEDIATION:\n")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
