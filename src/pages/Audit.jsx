import React, { useEffect, useState } from 'react'
import api from '../api'

const EVENEMENT_FR = {
  'login_success': 'Connexion réussie',
  'login_failed':  'Échec de connexion',
  'scan_created':  'Scan créé',
  'scan_launched': 'Scan lancé',
  'scan_updated':  'Scan mis à jour',
  'scan_stopped':  'Scan arrêté',
  'user_created':  'Utilisateur créé',
}

export default function Audit() {
  const [journaux, setJournaux] = useState([])
  useEffect(() => { api.get('/audit').then(r => setJournaux(r.data.log || [])).catch(() => {}) }, [])

  return (
    <div className="au-wrap">
      <style>{auCss}</style>
      <div className="au-h1">Journal d'audit</div>
      <div className="au-sub">Traçabilité complète des actions</div>

      <div className="au-card">
        <table className="au-table">
          <thead>
            <tr><th>Événement</th><th>Acteur</th><th>Adresse IP</th><th>Résultat</th><th>Détail</th><th>Date</th></tr>
          </thead>
          <tbody>
            {journaux.length === 0 ? (
              <tr><td colSpan={6} className="au-empty">Aucun journal</td></tr>
            ) : journaux.map(j => (
              <tr key={j.id}>
                <td className="au-ev">{EVENEMENT_FR[j.event_type] || j.event_type}</td>
                <td>{j.actor_username}</td>
                <td className="au-mono">{j.ip_address}</td>
                <td><span className={j.success ? 'au-ok' : 'au-ko'}>{j.success ? '✓ Succès' : '✗ Échec'}</span></td>
                <td className="au-detail">{j.detail}</td>
                <td className="au-date">{new Date(j.created_at).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const auCss = `
.au-wrap{ padding:30px 34px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.au-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.au-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.au-card{ margin-top:24px; background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:16px; overflow:hidden; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.au-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
.au-table thead th{ text-align:left; padding:14px 16px; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; color:#94a3b8; border-bottom:1px solid #e8ecf5; }
.au-table tbody tr{ border-bottom:1px solid #eef2f8; transition:.15s; }
.au-table tbody tr:hover{ background:rgba(99,102,241,.04); }
.au-table td{ padding:12px 16px; }
.au-ev{ color:#4f46e5; font-family:'JetBrains Mono',monospace; font-size:12.5px; }
.au-mono{ font-family:'JetBrains Mono',monospace; font-size:12.5px; color:#94a3b8; }
.au-ok{ color:#0d9488; font-weight:600; }
.au-ko{ color:#e11d48; font-weight:600; }
.au-detail{ color:#64748b; font-size:12.5px; }
.au-date{ color:#94a3b8; font-size:12.5px; }
.au-empty{ text-align:center; padding:38px; color:#94a3b8; }
`
