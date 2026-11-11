// LV_CLEAN_V3 — page live sans boutons Historique/Telecharger (doublons retires)
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AGENTS = [
  { id: "reconnaissance",         label: "Reconnaissance",           icon: "🔍", desc: "Scan des ports et services via Nmap" },
  { id: "rag_lookup",             label: "Recherche CVE",            icon: "🧠", desc: "Correspondance vectorielle dans la base CVE" },
  { id: "vulnerability_analysis", label: "Analyse de vulnérabilités", icon: "🔬", desc: "Évaluation du risque et scoring CVSS (Gemma)" },
  { id: "exploitation",           label: "Exploitation",             icon: "⚡", desc: "Exécution réelle via Metasploit" },
  { id: "report",                 label: "Génération du rapport",    icon: "📄", desc: "Rapport et enregistrement en base" },
];

const SEV_LIGHT = {
  critical: { bg: "rgba(244,63,94,.12)",  border: "rgba(244,63,94,.3)",  text: "#e11d48", label: "Critique" },
  high:     { bg: "rgba(245,158,11,.14)", border: "rgba(245,158,11,.3)", text: "#b45309", label: "Élevée"   },
  medium:   { bg: "rgba(99,102,241,.12)", border: "rgba(99,102,241,.3)", text: "#4f46e5", label: "Moyenne"  },
  low:      { bg: "rgba(16,185,129,.14)", border: "rgba(16,185,129,.3)", text: "#047857", label: "Faible"   },
};

export default function LiveScan() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("napt_token");

  const [target, setTarget]           = useState("");
  const [scanStatus, setScanStatus]   = useState("running");
  const [agentStates, setAgentStates] = useState(
    Object.fromEntries(AGENTS.map((a) => [a.id, { status: "idle", result: null }]))
  );
  const [recoData, setRecoData]       = useState(null);
  const [ragData, setRagData]         = useState(null);
  const [vulnData, setVulnData]       = useState(null);
  const [exploitData, setExploitData] = useState(null);
  const [lines, setLines]             = useState([]);
  const [connected, setConnected]     = useState(false);

  const termRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!scanId || !token) return;
    fetch(`/api/scans/${scanId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setTarget(d.target || "")).catch(() => {});
  }, [scanId]);

  useEffect(() => {
    if (!scanId || !token) return;
    const ws = new WebSocket(`ws://localhost:8000/api/scans/${scanId}/live?token=${token}`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => { try { handleEvent(JSON.parse(e.data)); } catch {} };
    return () => ws.close();
  }, [scanId]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  function handleEvent(ev) {
    const { type, agent, data, output } = ev;
    if (output) setLines((p) => [...p, { text: output, agent }]);
    if (type === "agent_start")
      setAgentStates((p) => ({ ...p, [agent]: { ...p[agent], status: "running" } }));
    if (type === "agent_result") {
      if (agent === "reconnaissance")        setRecoData(data);
      if (agent === "rag_lookup")            setRagData(data);
      if (agent === "vulnerability_analysis") setVulnData(data);
      if (agent === "exploitation")          setExploitData(data);
    }
    if (type === "agent_complete")
      setAgentStates((p) => ({ ...p, [agent]: { ...p[agent], status: "done" } }));
    if (type === "agent_error")
      setAgentStates((p) => ({ ...p, [agent || "report"]: { status: "error", result: null } }));
    if (type === "scan_complete") setScanStatus("completed");
    if (type === "scan_failed")   setScanStatus("failed");
    if (type === "stopped")       setScanStatus("stopped");
  }

  function stopScan() {
    fetch(`/api/scans/${scanId}/stop`, { method: "POST", headers: { Authorization: `Bearer ${token}` } })
      .then(() => setScanStatus("stopped"));
  }

  const isDone = scanStatus !== "running";

  function lineColor(text) {
    if (!text) return "#64748b";
    if (text.startsWith("✓") || text.includes("REUSSIE") || text.includes("opened") || text.includes("root")) return "#16a34a";
    if (text.startsWith("✗") || text.includes("failed") || text.includes("ERROR") || text.includes("echec")) return "#ef4444";
    if (text.startsWith("+") || text.startsWith("==="))   return "#a78bfa";
    if (text.startsWith("[") || text.startsWith("BILAN")) return "#f59e0b";
    if (text.includes("nmap") || text.includes("rag"))    return "#22d3ee";
    return "#cbd5e1";
  }

  function cardStyle(status) {
    if (status === "running") return { border: "#6366f1", dot: "#6366f1", text: "#4f46e5" };
    if (status === "done")    return { border: "#2dd4bf", dot: "#2dd4bf", text: "#0d9488" };
    if (status === "error")   return { border: "#f43f5e", dot: "#f43f5e", text: "#e11d48" };
    return { border: "#e8ecf5", dot: "#cbd5e1", text: "#94a3b8" };
  }

  function statusLabel() {
    if (scanStatus === "running")   return { text: "En cours…", color: "#4f46e5" };
    if (scanStatus === "completed") return { text: "Terminé",   color: "#0d9488" };
    if (scanStatus === "failed")    return { text: "Échoué",    color: "#e11d48" };
    if (scanStatus === "stopped")   return { text: "Arrêté",    color: "#b45309" };
    return { text: scanStatus, color: "#64748b" };
  }
  const sl = statusLabel();
  const doneCount = AGENTS.filter((a) => agentStates[a.id].status === "done").length;
  let reachedIdx = -1;
  AGENTS.forEach((a, i) => { if (agentStates[a.id].status !== "idle") reachedIdx = i; });
  const fillPct = reachedIdx <= 0 ? 0 : (reachedIdx / (AGENTS.length - 1)) * 100;

  const glass = { background: "rgba(255,255,255,.82)", backdropFilter: "blur(10px)", border: "1px solid #e8ecf5", boxShadow: "0 14px 34px -24px rgba(79,70,229,.3)" };
  const innerBox = { marginTop: 12, background: "#f6f8fc", border: "1px solid #e8ecf5", borderRadius: 10, padding: 12, fontSize: 12 };

  return (
    <div style={{ minHeight: "100%", padding: "28px 30px", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#0f172a" }}>
      <style>{liveCss}</style>

      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ ...glass, color: "#64748b", borderRadius: 10, padding: "6px 13px", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>←</button>
          <div>
            <div className="lv-title">Scan en direct</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Cible : <span style={{ color: "#4f46e5", fontFamily: "'JetBrains Mono',monospace" }}>{target || scanId}</span></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: connected ? "#0d9488" : "#94a3b8", background: connected ? "rgba(45,212,191,.12)" : "#eef2f8", borderRadius: 999, padding: "5px 12px" }}>
            {connected ? "● WebSocket connecté" : "○ WebSocket déconnecté"}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: sl.color, background: "#fff", border: "1px solid #e8ecf5", borderRadius: 999, padding: "5px 14px" }}>{sl.text}</span>
          {!isDone && <button onClick={stopScan} className="lv-stop">■ Arrêter</button>}
        </div>
      </div>

      {/* Layout principal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20, alignItems: "start" }}>
        {/* GAUCHE : pipeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...glass, borderRadius: 14, padding: "22px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Progression du pipeline</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0d9488" }}>{doneCount} / {AGENTS.length} agents</span>
            </div>
            <div className="lv-steps">
              <div className="lv-track"><div className="lv-fill" style={{ width: `${fillPct}%` }} /></div>
              {AGENTS.map((a) => {
                const st = agentStates[a.id].status;
                return (
                  <div key={a.id} className={"lv-step" + (st === "done" ? " lv-sdone" : st === "running" ? " lv-sactive" : st === "error" ? " lv-serr" : "")}>
                    <div className="lv-node">{st === "done" ? "✓" : a.icon}</div>
                    <span className="lv-lbl">{a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {AGENTS.map((agent, idx) => {
            const state = agentStates[agent.id];
            const cs = cardStyle(state.status);
            const isIdle = state.status === "idle";
            return (
              <div key={agent.id} style={{ ...glass, border: `1px solid ${cs.border}`, borderRadius: 14, padding: "16px 18px", opacity: isIdle ? 0.6 : 1, transition: "all .35s ease", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: state.status === "done" ? "linear-gradient(135deg,#2dd4bf,#0d9488)" : state.status === "running" ? "linear-gradient(135deg,#6366f1,#06b6d4)" : "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, color: "#fff" }}>
                      {state.status === "done" ? "✓" : agent.icon}
                    </div>
                    <div style={{ position: "absolute", top: -3, right: -3, width: 11, height: 11, borderRadius: "50%", background: cs.dot, animation: state.status === "running" ? "lvpulse 1.2s infinite" : "none", border: "2px solid #fff" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: isIdle ? "#94a3b8" : "#0f172a" }}>{agent.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: cs.text, background: "#fff", border: `1px solid ${cs.border}`, borderRadius: 999, padding: "3px 10px" }}>
                        {state.status === "idle" ? "En attente" : state.status === "running" ? "En cours" : state.status === "done" ? "Terminé" : state.status === "error" ? "Erreur" : state.status}
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>{agent.desc}</div>

                    {state.status === "running" && (
                      <div style={{ marginTop: 10, height: 3, background: "#eef2f8", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "40%", background: "#6366f1", borderRadius: 2, animation: "lvslide 1.5s ease-in-out infinite" }} />
                      </div>
                    )}

                    {agent.id === "reconnaissance" && recoData && (
                      <div style={innerBox}>
                        <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ color: "#64748b" }}>Hôte :</span><span style={{ color: "#4f46e5" }}>{recoData.host}</span>
                          {recoData.latency && <><span style={{ color: "#64748b" }}>Latence :</span><span>{recoData.latency}</span></>}
                          <span style={{ color: "#64748b" }}>Ports ouverts :</span><span style={{ color: "#0d9488", fontWeight: 600 }}>{recoData.ports_count}</span>
                        </div>
                        {recoData.ports?.length > 0 && (
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead><tr style={{ color: "#94a3b8" }}>
                              <th style={{ textAlign: "left", paddingBottom: 4, fontWeight: 500 }}>PORT</th>
                              <th style={{ textAlign: "left", paddingBottom: 4, fontWeight: 500 }}>SERVICE</th>
                              <th style={{ textAlign: "left", paddingBottom: 4, fontWeight: 500 }}>VERSION</th>
                            </tr></thead>
                            <tbody>{recoData.ports.map((p, i) => (
                              <tr key={i}>
                                <td style={{ color: "#b45309", paddingBottom: 3 }}>{p.port}</td>
                                <td style={{ color: "#2563eb", paddingBottom: 3 }}>{p.service}</td>
                                <td style={{ color: "#64748b", paddingBottom: 3 }}>{p.version || "—"}</td>
                              </tr>
                            ))}</tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {agent.id === "rag_lookup" && ragData && (
                      <div style={innerBox}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(99,102,241,.1)", borderRadius: 6, padding: "3px 10px", color: "#4f46e5", fontWeight: 600 }}>{ragData.cve_id}</span>
                          {ragData.severity && (() => {
                            const sc = SEV_LIGHT[ragData.severity?.toLowerCase()] || SEV_LIGHT.medium;
                            return <span style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "3px 10px", color: sc.text, fontWeight: 600 }}>{sc.label} · CVSS {ragData.cvss}</span>;
                          })()}
                          {ragData.findings_count > 1 && <span style={{ background: "rgba(45,212,191,.12)", borderRadius: 6, padding: "3px 10px", color: "#0d9488", fontWeight: 600 }}>{ragData.findings_count} CVE détectées</span>}
                        </div>
                      </div>
                    )}

                    {agent.id === "vulnerability_analysis" && vulnData && (
                      <div style={innerBox}>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ color: "#64748b" }}>Score CVSS :</span><span style={{ color: "#b45309", fontWeight: 600 }}>{vulnData.cvss}</span>
                          {vulnData.cvss_vector && <><span style={{ color: "#64748b" }}>Vecteur :</span><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{vulnData.cvss_vector}</span></>}
                        </div>
                        {vulnData.analysis && <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.6 }}>{vulnData.analysis}</div>}
                      </div>
                    )}

                    {agent.id === "exploitation" && exploitData && (
                      <div style={innerBox}>
                        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ color: "#64748b" }}>Résultat :</span>
                          <span style={{ color: exploitData.success ? "#16a34a" : "#ef4444", fontWeight: 600 }}>
                            {exploitData.success ? "✓ Exploitation réussie" : "✗ Non confirmée"}
                          </span>
                          {typeof exploitData.exploited_count === "number" && (
                            <span style={{ background: "rgba(45,212,191,.12)", borderRadius: 6, padding: "3px 10px", color: "#0d9488", fontWeight: 600 }}>
                              {exploitData.exploited_count}/{exploitData.total} sessions ouvertes
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {agent.id === "report" && state.status === "done" && (
                      <div style={{ marginTop: 10, fontSize: 12.5, color: "#0d9488", fontWeight: 500 }}>✓ Rapport enregistré et disponible au téléchargement</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {scanStatus === "completed" && (
            <div style={{ ...glass, border: "1px solid rgba(45,212,191,.4)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>✅</div>
              <div style={{ color: "#0d9488", fontWeight: 700, fontSize: 17 }}>Scan terminé avec succès</div>
              {ragData?.cve_id && <div style={{ fontSize: 13, color: "#0f766e", marginTop: 6 }}>{ragData.cve_id} · CVSS {ragData.cvss}</div>}
              <button onClick={() => navigate('/scans')} className="lv-primary" style={{ marginTop: 14 }}>Voir tous les scans →</button>
            </div>
          )}

          {(scanStatus === "failed" || scanStatus === "stopped") && (
            <div style={{ ...glass, border: "1px solid rgba(244,63,94,.4)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{scanStatus === "stopped" ? "⛔" : "❌"}</div>
              <div style={{ color: "#e11d48", fontWeight: 700, fontSize: 16 }}>{scanStatus === "stopped" ? "Scan arrêté manuellement" : "Scan échoué"}</div>
            </div>
          )}
        </div>

        {/* DROITE : terminal (sombre = pro) */}
        <div style={{ background: "#0b1120", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "fit-content", position: "sticky", top: 20, boxShadow: "0 20px 50px -20px rgba(15,23,42,.5)" }}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#34d399" }} />
            </div>
            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 6, fontFamily: "'JetBrains Mono',monospace" }}>sortie en direct</span>
          </div>
          <div ref={termRef} style={{ height: 520, overflowY: "auto", padding: "14px 16px", fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, lineHeight: 1.8, background: "#0b1120" }}>
            {lines.length === 0 && (
              <div style={{ color: "#475569" }}>En attente du démarrage du scan…{scanStatus === "running" && <span style={{ animation: "lvblink 1s step-end infinite" }}> █</span>}</div>
            )}
            {lines.map((l, i) => (
              <div key={i} style={{ color: lineColor(l.text), whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{l.text}</div>
            ))}
            {scanStatus === "running" && lines.length > 0 && <div style={{ color: "#22d3ee", animation: "lvblink 1s step-end infinite" }}>█</div>}
          </div>
          <div style={{ padding: "8px 16px", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>{lines.length} ligne{lines.length !== 1 ? "s" : ""}</span>
            <span style={{ fontSize: 11, color: "#64748b" }}>ID : {scanId?.slice(0, 8)}…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const liveCss = `
.lv-title{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:21px; background:linear-gradient(100deg,#6366f1,#06b6d4 60%,#2dd4bf); -webkit-background-clip:text; background-clip:text; color:transparent; }
.lv-primary{ background:linear-gradient(100deg,#6366f1,#06b6d4); border:none; color:#fff; border-radius:10px; padding:8px 16px; cursor:pointer; font-size:13px; font-weight:600; box-shadow:0 12px 26px -12px rgba(79,70,229,.6); }
.lv-stop{ background:linear-gradient(100deg,#f43f5e,#e11d48); border:none; color:#fff; border-radius:10px; padding:7px 16px; cursor:pointer; font-size:13px; font-weight:600; }
@keyframes lvpulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
@keyframes lvslide{ 0%{transform:translateX(-100%)} 50%{transform:translateX(150%)} 100%{transform:translateX(150%)} }
@keyframes lvblink{ 0%,100%{opacity:1} 50%{opacity:0} }
.lv-steps{ display:flex; align-items:flex-start; justify-content:space-between; position:relative; }
.lv-track{ position:absolute; top:21px; left:48px; right:48px; height:3px; background:#e8ecf5; border-radius:3px; overflow:hidden; }
.lv-fill{ position:absolute; inset:0; width:0; background:linear-gradient(90deg,#6366f1,#06b6d4,#2dd4bf); border-radius:3px; transition:width .6s; }
.lv-step{ display:flex; flex-direction:column; align-items:center; gap:10px; flex:1; position:relative; z-index:1; }
.lv-node{ width:44px; height:44px; border-radius:50%; background:#fff; border:2px solid #e8ecf5; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:18px; transition:.4s; }
.lv-sdone .lv-node{ background:linear-gradient(135deg,#2dd4bf,#0d9488); border-color:transparent; color:#fff; }
.lv-sactive .lv-node{ background:linear-gradient(135deg,#6366f1,#06b6d4); border-color:transparent; color:#fff; animation:lvglow 1.4s infinite; }
.lv-serr .lv-node{ background:linear-gradient(135deg,#f43f5e,#e11d48); border-color:transparent; color:#fff; }
@keyframes lvglow{ 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.45)} 50%{box-shadow:0 0 0 9px rgba(99,102,241,0)} }
.lv-lbl{ font-size:12px; font-weight:500; color:#94a3b8; text-align:center; }
.lv-sdone .lv-lbl,.lv-sactive .lv-lbl{ color:#0f172a; }
`
