import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const COULEURS = ['#ff4466','#ffaa00','#00d4ff','#00ff88']

export default function TableauDeBord() {
  const [stats, setStats] = useState(null)
  const [rag,   setRag]   = useState(null)

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/rag/stats').then(r => setRag(r.data)).catch(() => {})
  }, [])

  const donneesSevirete = stats ? [
    { nom: 'Critique', valeur: stats.severity?.critical || 0 },
    { nom: 'Élevée',   valeur: stats.severity?.high     || 0 },
    { nom: 'Moyenne',  valeur: stats.severity?.medium   || 0 },
    { nom: 'Faible',   valeur: stats.severity?.low      || 0 },
  ] : []

  const cartes = [
    { label: 'Total Scans',       valeur: stats?.total_scans ?? '—', icone: '🔍', couleur: 'text-napt-accent' },
    { label: 'CVEs Détectées',    valeur: stats?.total_cves  ?? '—', icone: '🐛', couleur: 'text-red-400' },
    { label: 'Vecteurs RAG',      valeur: rag?.vectors_count ?? '—', icone: '🧠', couleur: 'text-purple-400' },
    { label: 'Utilisateurs',      valeur: stats?.total_users ?? '—', icone: '👥', couleur: 'text-napt-green' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble — N.A.P.T v2.0</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {cartes.map(c => (
          <div key={c.label} className="bg-napt-800 rounded-xl p-5 border border-napt-700 glow">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 mb-1">{c.label}</div>
                <div className={`text-3xl font-bold ${c.couleur}`}>{c.valeur}</div>
              </div>
              <span className="text-2xl">{c.icone}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-napt-800 rounded-xl p-6 border border-napt-700">
          <h3 className="text-sm font-semibold mb-4 text-gray-400">Répartition par Sévérité</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donneesSevirete}>
              <XAxis dataKey="nom" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #1a2240' }} />
              <Bar dataKey="valeur" radius={[4,4,0,0]}>
                {donneesSevirete.map((_, i) => <Cell key={i} fill={COULEURS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-napt-800 rounded-xl p-6 border border-napt-700">
          <h3 className="text-sm font-semibold mb-4 text-gray-400">Système RAG — Qdrant</h3>
          {rag ? (
            <div className="space-y-3">
              {[
                ['Modèle',     rag.model],
                ['Dimension',  rag.dimension + ' dim'],
                ['Distance',   rag.distance],
                ['Vecteurs',   rag.vectors_count],
                ['Statut',     rag.status],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-napt-700 last:border-0">
                  <span className="text-xs text-gray-500">{k}</span>
                  <span className="text-sm font-mono text-napt-accent">{v}</span>
                </div>
              ))}
            </div>
          ) : <div className="text-gray-600 text-sm">Chargement...</div>}
        </div>
      </div>
    </div>
  )
}
