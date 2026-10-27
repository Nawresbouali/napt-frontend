import React, { useEffect, useState } from 'react'
import api from '../api'

const EVENEMENT_FR = {
  'login_success': 'Connexion réussie',
  'login_failed':  'Échec de connexion',
  'scan_created':  'Scan créé',
  'scan_updated':  'Scan mis à jour',
  'user_created':  'Utilisateur créé',
}

export default function Audit() {
  const [journaux, setJournaux] = useState([])
  useEffect(() => { api.get('/audit').then(r => setJournaux(r.data.log || [])).catch(() => {}) }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Journal d'audit</h1>
        <p className="text-gray-500 text-sm mt-1">Traçabilité complète des actions</p>
      </div>
      <div className="bg-napt-800 rounded-xl border border-napt-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-napt-700">
            <tr className="text-xs text-gray-500">
              <th className="px-4 py-3 text-left">Événement</th>
              <th className="px-4 py-3 text-left">Acteur</th>
              <th className="px-4 py-3 text-left">Adresse IP</th>
              <th className="px-4 py-3 text-left">Résultat</th>
              <th className="px-4 py-3 text-left">Détail</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {journaux.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">Aucun journal</td></tr>
            ) : journaux.map(j => (
              <tr key={j.id} className="border-b border-napt-700/50 hover:bg-napt-700/30">
                <td className="px-4 py-3 text-napt-accent text-xs font-mono">
                  {EVENEMENT_FR[j.event_type] || j.event_type}
                </td>
                <td className="px-4 py-3">{j.actor_username}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{j.ip_address}</td>
                <td className="px-4 py-3">
                  <span className={j.success ? 'text-napt-green' : 'text-red-400'}>
                    {j.success ? '✓ Succès' : '✗ Échec'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{j.detail}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(j.created_at).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
