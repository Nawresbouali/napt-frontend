import React, { useState } from 'react'
import api from '../api'

export default function RechercheCVE() {
  const [requete, setRequete] = useState('')
  const [resultats, setResultats] = useState([])
  const [chargement, setChargement] = useState(false)

  const rechercher = async e => {
    e.preventDefault(); setChargement(true)
    try {
      const { data } = await api.post('/rag/search', { query: requete, limit: 5 })
      setResultats(data.results)
    } catch { alert('Erreur RAG') }
    finally { setChargement(false) }
  }

  const SEV_CSS = { critical:'text-red-400', high:'text-orange-400', medium:'text-yellow-400', low:'text-green-400' }
  const SEV_FR  = { critical:'Critique', high:'Élevée', medium:'Moyenne', low:'Faible' }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Recherche CVE — RAG</h1>
        <p className="text-gray-500 text-sm mt-1">Recherche sémantique — all-mpnet-base-v2 (768 dimensions)</p>
      </div>
      <form onSubmit={rechercher} className="flex gap-3 mb-6">
        <input
          className="flex-1 bg-napt-800 border border-napt-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-napt-accent"
          placeholder="Ex: Exécution de code à distance Apache Tomcat, escalade de privilèges Linux..."
          value={requete}
          onChange={e => setRequete(e.target.value)}
          required
        />
        <button type="submit" disabled={chargement}
          className="bg-napt-accent text-napt-900 font-bold px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50">
          {chargement ? '...' : '🔍 Rechercher'}
        </button>
      </form>
      <div className="space-y-3">
        {resultats.map((r, i) => (
          <div key={i} className="bg-napt-800 rounded-xl p-5 border border-napt-700 hover:border-napt-accent/40 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-napt-accent font-bold">{r.cve_id}</span>
                <span className={`text-xs font-semibold ${SEV_CSS[r.severity] || 'text-gray-400'}`}>
                  {SEV_FR[r.severity] || r.severity}
                </span>
                <span className="text-xs text-gray-500">CVSS {r.cvss}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Similarité</div>
                <div className="text-napt-green font-mono font-bold">{(r.score * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-200 mb-1">{r.product}</div>
            <div className="text-sm text-gray-400">{r.text?.split('|').slice(-1)[0]?.trim()}</div>
            <div className="mt-2">
              <span className="text-xs bg-napt-700 text-gray-400 px-2 py-0.5 rounded">{r.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
