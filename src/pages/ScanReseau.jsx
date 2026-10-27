import { useState } from "react"
export default function ScanReseau() {
  const token = localStorage.getItem("napt_token")
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
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Scan Reseau</h1>
      <div className="bg-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex gap-3">
          <button onClick={() => setMode("network")} className={`flex-1 py-2 rounded-lg font-semibold ${mode==="network"?"bg-blue-600 text-white":"bg-gray-700 text-gray-300"}`}>Reseau local</button>
          <button onClick={() => setMode("target")} className={`flex-1 py-2 rounded-lg font-semibold ${mode==="target"?"bg-blue-600 text-white":"bg-gray-700 text-gray-300"}`}>Cible specifique</button>
        </div>
        {mode === "target" && <input value={host} onChange={e=>setHost(e.target.value)} placeholder="Ex: 192.168.1.1" className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 outline-none"/>}
        <button onClick={lancer} disabled={loading||(mode==="target"&&!host)} className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold rounded-lg">
          {loading ? "Scan en cours..." : "Lancer le scan"}
        </button>
        {error && <div className="p-3 bg-red-900 text-red-300 rounded-lg">{error}</div>}
        {result && mode==="network" && (
          <div>
            <p className="text-green-400 font-semibold mb-2">{result.hosts_found} machine(s) trouvee(s)</p>
            {result.hosts.map((h,i)=><div key={i} className="flex gap-3 bg-gray-700 p-3 rounded-lg mb-2"><span className="text-white font-mono">{h.host}</span><span className="text-green-400 ml-auto">{h.status}</span></div>)}
          </div>
        )}
        {result && mode==="target" && (
          <div>
            <p className="text-green-400 font-semibold mb-2">{result.ports.length} port(s) sur {result.target}</p>
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-600">
                <th className="py-2 text-left">Port</th>
                <th className="py-2 text-left">Etat</th>
                <th className="py-2 text-left">Service</th>
                <th className="py-2 text-left">Version</th>
              </tr></thead>
              <tbody>{result.ports.map((p,i)=>(
                <tr key={i} className="border-b border-gray-700 text-white">
                  <td className="py-2 font-mono text-blue-400">{p.port}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${p.state==="open"?"bg-green-800 text-green-300":"bg-gray-600 text-gray-300"}`}>{p.state}</span></td>
                  <td className="py-2">{p.service}</td>
                  <td className="py-2 text-gray-400 text-xs">{p.version}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
