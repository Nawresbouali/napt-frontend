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
    } catch(e) {
      setReponse('Erreur : ' + (e.response?.data?.detail || e.message))
    } finally { setChargement(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analyse IA — Gemma 4</h1>
        <p className="text-gray-500 text-sm mt-1"></p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-napt-800 rounded-xl p-6 border border-napt-700">
          <h3 className="text-sm font-semibold mb-4">📝 Analyser une CVE</h3>
          <form onSubmit={analyser} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Identifiant CVE</label>
              <input
                className="w-full bg-napt-900 border border-napt-700 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-napt-accent"
                placeholder="CVE-2021-44228"
                value={cve}
                onChange={e => setCve(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Question (optionnel)</label>
              <textarea
                className="w-full bg-napt-900 border border-napt-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-napt-accent resize-none"
                rows={3}
                placeholder="Laisser vide pour une analyse complète..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />
            </div>
            <button type="submit" disabled={chargement}
              className="w-full bg-napt-accent text-napt-900 font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50">
              {chargement ? '🤖 Analyse en cours...' : '🤖 Analyser avec Gemma 4'}
            </button>
          </form>
          <div className="mt-4 p-3 bg-napt-900 rounded-lg border border-napt-700/50">
            <div className="text-xs text-gray-500">Modèle actif</div>
            <div className="text-sm font-mono text-blue-400 mt-1">gemma 4 26B A4B (OpenRouter)</div>
            <div className="text-xs text-gray-600 mt-1">Inférence cloud — OpenRouter API</div>
          </div>
        </div>
        <div className="bg-napt-800 rounded-xl p-6 border border-napt-700">
          <h3 className="text-sm font-semibold mb-4">🤖 Réponse de Gemma 4</h3>
          {chargement ? (
            <div className="flex items-center gap-3 text-napt-accent">
              <div className="animate-spin">⟳</div>
              <span className="text-sm">Génération en cours...</span>
            </div>
          ) : reponse ? (
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono bg-napt-900 p-4 rounded-lg border border-napt-700 max-h-80 overflow-auto">
              {reponse}
            </div>
          ) : (
            <div className="text-gray-600 text-sm text-center py-12">
              Entrez un identifiant CVE et cliquez sur Analyser
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
