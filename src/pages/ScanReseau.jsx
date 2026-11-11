// SR_SCAN — bouton Scanner (lance un scan N.A.P.T sur la cible decouverte) + reset onglet
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ScanReseau() {
  const token = localStorage.getItem("napt_token")
  const navigate = useNavigate()
  const extractIp = (s) => { const m = String(s).match(/(\d+\.\d+\.\d+\.\d+)/); return m ? m[1] : s }
  const scannerCible = async (ip) => {
    try {
      const r = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target: ip, target_type: "ip" })
      })
      const d = await r.json()
      if (d.id) navigate(`/scans/${d.id}/live`)
      else alert("Erreur au lancement du scan")
    } catch (e) { alert("Erreur au lancement du scan") }
  }
  const [mode, setMode] = useState("network")
  const [host, setHost] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const lancer = async () => {
    setLoading(true); setResult(null); setError(null)
    try {
      const url = mode === "network" ? "/api/scans/nmap-network" : `/api/scans/nmap-target?host=${encodeURIComponent(host)}`
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) throw new Error(`Erreur ${r.status}`)
      setResult(await r.json())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="sr-wrap">
      <style>{srCss}</style>
      <div className="sr-h1">Scan Réseau</div>
      <div className="sr-sub">Découverte réseau et scan de ports via Nmap</div>

      <div className="sr-card">
        <div className="sr-tabs">
          <button className={"sr-tab" + (mode === "network" ? " sr-on" : "")} onClick={() => { setMode("network"); setResult(null); setError(null) }}>Réseau local</button>
          <button className={"sr-tab" + (mode === "target" ? " sr-on" : "")} onClick={() => { setMode("target"); setResult(null); setError(null) }}>Cible spécifique</button>
        </div>

        {mode === "target" && (
          <input className="sr-inp" value={host} onChange={e => setHost(e.target.value)} placeholder="Ex : 192.168.1.1" />
        )}

        <button className="sr-go" onClick={lancer} disabled={loading || (mode === "target" && !host)}>
          {loading ? "Scan en cours…" : "Lancer le scan"}
        </button>

        {error && <div className="sr-err">{error}</div>}

        {result && result.hosts && mode === "network" && (
          <div className="sr-res">
            <p className="sr-ok">{result.hosts_found} machine(s) trouvée(s)</p>
            {result.hosts.map((h, i) => (
              <div className="sr-host" key={i}>
                <span className="sr-mono">{h.host}</span>
                <span className="sr-up">{h.status}</span>
                <button className="sr-scan" onClick={() => scannerCible(extractIp(h.host))}>⚡ Scanner</button>
              </div>
            ))}
          </div>
        )}

        {result && result.ports && mode === "target" && (
          <div className="sr-res">
            <p className="sr-ok">{result.ports.length} port(s) sur {result.target}</p>
            <table className="sr-table">
              <thead><tr><th>Port</th><th>État</th><th>Service</th><th>Version</th></tr></thead>
              <tbody>{result.ports.map((p, i) => (
                <tr key={i}>
                  <td className="sr-mono sr-blue">{p.port}</td>
                  <td><span className={"sr-badge " + (p.state === "open" ? "sr-b-open" : "sr-b-closed")}>{p.state}</span></td>
                  <td>{p.service}</td>
                  <td className="sr-ver">{p.version}</td>
                </tr>
              ))}</tbody>
            </table>
            <button className="sr-scan-big" onClick={() => scannerCible(result.target)}>⚡ Lancer un scan N.A.P.T complet sur {result.target}</button>
          </div>
        )}
      </div>
    </div>
  )
}

const srCss = `
.sr-wrap{ padding:30px 34px; max-width:860px; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.sr-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:28px; }
.sr-sub{ font-size:14px; color:#64748b; margin-top:4px; }
.sr-card{ margin-top:24px; background:rgba(255,255,255,.82); backdrop-filter:blur(10px); border:1px solid #e8ecf5; border-radius:18px; padding:22px; box-shadow:0 14px 34px -24px rgba(79,70,229,.3); }
.sr-tabs{ display:flex; gap:10px; margin-bottom:16px; }
.sr-tab{ flex:1; height:44px; border:1px solid #e8ecf5; border-radius:12px; background:#fff; color:#64748b; font-weight:600; font-size:14px; cursor:pointer; transition:.25s; }
.sr-tab:hover{ border-color:rgba(99,102,241,.4); }
.sr-on{ color:#fff !important; border-color:transparent !important; background:linear-gradient(100deg,#6366f1,#06b6d4); box-shadow:0 10px 22px -10px rgba(99,102,241,.5); }
.sr-inp{ width:100%; height:46px; border:1px solid #e8ecf5; border-radius:12px; padding:0 16px; font-size:15px; font-family:'JetBrains Mono',monospace; outline:none; background:#fff; margin-bottom:16px; color:#0f172a; }
.sr-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.sr-go{ width:100%; height:48px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; }
.sr-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.sr-go:disabled{ opacity:.55; cursor:default; }
.sr-err{ margin-top:16px; background:rgba(244,63,94,.1); color:#e11d48; border:1px solid rgba(244,63,94,.25); border-radius:12px; padding:12px 14px; font-size:13.5px; }
.sr-res{ margin-top:18px; }
.sr-ok{ color:#0d9488; font-weight:600; font-size:14px; margin-bottom:12px; }
.sr-host{ display:flex; align-items:center; gap:12px; background:#f6f8fc; border:1px solid #e8ecf5; border-radius:12px; padding:11px 14px; margin-bottom:8px; }
.sr-mono{ font-family:'JetBrains Mono',monospace; }
.sr-blue{ color:#2563eb; }
.sr-up{ margin-left:auto; color:#0d9488; font-size:13px; font-weight:500; }
.sr-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
.sr-table thead th{ text-align:left; padding:9px 8px; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; color:#94a3b8; border-bottom:1px solid #e8ecf5; }
.sr-table td{ padding:10px 8px; border-bottom:1px solid #eef2f8; }
.sr-badge{ font-size:11px; font-weight:700; padding:2px 9px; border-radius:999px; }
.sr-b-open{ background:rgba(16,185,129,.14); color:#047857; }
.sr-b-closed{ background:#eef2f8; color:#64748b; }
.sr-ver{ color:#94a3b8; font-size:12.5px; }
.sr-scan{ margin-left:12px; font-size:12px; font-weight:600; padding:6px 13px; border:none; border-radius:9px; color:#fff; background:linear-gradient(100deg,#6366f1,#06b6d4); cursor:pointer; transition:.25s; white-space:nowrap; }
.sr-scan:hover{ transform:translateY(-1px); box-shadow:0 8px 18px -8px rgba(99,102,241,.6); }
.sr-scan-big{ margin-top:16px; width:100%; height:46px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; }
.sr-scan-big:hover{ background-position:right center; transform:translateY(-2px); }
`
