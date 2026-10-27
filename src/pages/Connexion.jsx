import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Connexion() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
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
    <div className="min-h-screen bg-napt-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-3xl font-bold text-napt-accent tracking-widest">N.A.P.T</h1>
          <p className="text-gray-500 text-sm mt-2">Nawres Autonomous Pentest Tool</p>
        </div>
        <div className="bg-napt-800 rounded-2xl p-8 border border-napt-700 glow">
          <h2 className="text-lg font-semibold mb-6 text-center">Connexion</h2>
          <form onSubmit={soumettre} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nom d'utilisateur</label>
              <input
                className="w-full bg-napt-900 border border-napt-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-napt-accent"
                placeholder="nom d'utilisateur"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Mot de passe</label>
              <input type="password"
                className="w-full bg-napt-900 border border-napt-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-napt-accent"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
            {erreur && <div className="text-red-400 text-sm text-center">{erreur}</div>}
            <button type="submit" disabled={chargement}
              className="w-full bg-napt-accent text-napt-900 font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 mt-2">
              {chargement ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">
          PFE Cycle Ingénieur — Sécurité Informatique 2026
        </p>
      </div>
    </div>
  )
}
