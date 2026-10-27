import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AGENTS = [
  {
    id: "reconnaissance",
    label: "Reconnaissance",
    icon: "🔍",
    desc: "Scan des ports et services via Nmap",
  },
  {
    id: "rag_lookup",
    label: "Recherche CVE",
    icon: "🧠",
    desc: "Correspondance vectorielle dans la base ExploitDB",
  },
  {
    id: "vulnerability_analysis",
    label: "Analyse de vulnérabilités",
    icon: "🔬",
    desc: "Évaluation du risque et scoring CVSS",
  },
  {
    id: "exploitation",
    label: "Exploitation",
    icon: "⚡",
    desc: "Analyse d'exploitation via Gemma 4 + RAG",
  },
  {
    id: "report",
    label: "Génération du rapport",
    icon: "📄",
    desc: "Rapport HTML/PDF et enregistrement en base",
  },
];

const SEVERITY_COLOR = {
  critical: { bg: "#2d0a0a", border: "#7f1d1d", text: "#fca5a5", label: "Critique" },
  high:     { bg: "#2d1200", border: "#7c2d12", text: "#fcd34d", label: "Élevée"   },
  medium:   { bg: "#1a2000", border: "#365314", text: "#bef264", label: "Moyenne"  },
  low:      { bg: "#0c1a2e", border: "#1e3a5f", text: "#93c5fd", label: "Faible"   },
};

export default function LiveScan() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("napt_token");

  const [target, setTarget]         = useState("");
  const [scanStatus, setScanStatus] = useState("running");
  const [agentStates, setAgentStates] = useState(
    Object.fromEntries(AGENTS.map((a) => [a.id, { status: "idle", result: null }]))
  );
  const [recoData,  setRecoData]  = useState(null);
  const [ragData,   setRagData]   = useState(null);
  const [vulnData,  setVulnData]  = useState(null);
  const [exploitData, setExploitData] = useState(null);
  const [lines,     setLines]     = useState([]);
  const [connected, setConnected] = useState(false);

  const termRef = useRef(null);
  const wsRef   = useRef(null);

  // Charger les infos du scan
  useEffect(() => {
    if (!scanId || !token) return;
    fetch(`/api/scans/${scanId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setTarget(d.target || ""))
      .catch(() => {});
  }, [scanId]);

  // Connexion WebSocket
  useEffect(() => {
    if (!scanId || !token) return;
    const ws = new WebSocket(
      `ws://localhost:8000/api/scans/${scanId}/live?token=${token}`
    );
    wsRef.current = ws;
    ws.onopen  = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try { handleEvent(JSON.parse(e.data)); } catch {}
    };
    return () => ws.close();
  }, [scanId]);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current)
      termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  function handleEvent(ev) {
    const { type, agent, data, output } = ev;

    if (output) setLines((p) => [...p, { text: output, agent }]);

    if (type === "agent_start") {
      setAgentStates((p) => ({
        ...p,
        [agent]: { ...p[agent], status: "running" },
      }));
    }
    if (type === "agent_result") {
      if (agent === "reconnaissance")       setRecoData(data);
      if (agent === "rag_lookup")           setRagData(data);
      if (agent === "vulnerability_analysis") setVulnData(data);
      if (agent === "exploitation")         setExploitData(data);
    }
    if (type === "agent_complete") {
      setAgentStates((p) => ({
        ...p,
        [agent]: { ...p[agent], status: "done" },
      }));
    }
    if (type === "agent_error") {
      setAgentStates((p) => ({
        ...p,
        [agent || "report"]: { status: "error", result: null },
      }));
    }
    if (type === "scan_complete") setScanStatus("completed");
    if (type === "scan_failed")   setScanStatus("failed");
    if (type === "stopped")       setScanStatus("stopped");
  }

  function stopScan() {
    fetch(`/api/scans/${scanId}/stop`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setScanStatus("stopped"));
  }

  const isDone = scanStatus !== "running";

  // Couleur ligne terminal
  function lineColor(text) {
    if (!text) return "#6b7280";
    if (text.startsWith("✓") || text.includes("CONFIRMED") || text.includes("ROOT"))
      return "#22c55e";
    if (text.startsWith("✗") || text.includes("failed") || text.includes("ERROR"))
      return "#ef4444";
    if (text.startsWith("+"))   return "#a78bfa";
    if (text.startsWith("[NAPT")) return "#f59e0b";
    if (text.startsWith("Starting Nmap")) return "#22d3ee";
    return "#9ca3af";
  }

  // Style carte agent selon statut
  function cardStyle(status) {
    if (status === "running") return { border: "#22d3ee", bg: "#0a1929", dot: "#22d3ee", text: "#22d3ee" };
    if (status === "done")    return { border: "#22c55e", bg: "#052e16", dot: "#22c55e", text: "#22c55e" };
    if (status === "error")   return { border: "#ef4444", bg: "#2d0a0a", dot: "#ef4444", text: "#ef4444" };
    return { border: "#1f2937", bg: "#0d1117", dot: "#374151", text: "#6b7280" };
  }

  function statusLabel() {
    if (scanStatus === "running")   return { text: "En cours...", color: "#22d3ee" };
    if (scanStatus === "completed") return { text: "Terminé",     color: "#22c55e" };
    if (scanStatus === "failed")    return { text: "Échoué",      color: "#ef4444" };
    if (scanStatus === "stopped")   return { text: "Arrêté",      color: "#f59e0b" };
    return { text: scanStatus, color: "#9ca3af" };
  }

  const sl = statusLabel();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      color: "#e5e7eb",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "24px",
    }}>
      {/* ── En-tête ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#161b22", border: "1px solid #30363d",
              color: "#9ca3af", borderRadius: 8, padding: "6px 12px",
              cursor: "pointer", fontSize: 18, lineHeight: 1,
            }}
          >←</button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f3f4f6" }}>
              🚀 Scan en direct
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              Cible : <span style={{ color: "#22d3ee" }}>{target || scanId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* WS badge */}
          <span style={{
            fontSize: 12,
            color: connected ? "#22c55e" : "#6b7280",
            background: connected ? "#052e16" : "#161b22",
            border: `1px solid ${connected ? "#166534" : "#30363d"}`,
            borderRadius: 6, padding: "4px 10px",
          }}>
            {connected ? "● WebSocket connecté" : "○ WebSocket déconnecté"}
          </span>

          {/* Statut scan */}
          <span style={{
            fontSize: 13, fontWeight: 600, color: sl.color,
            background: "#161b22", border: `1px solid ${sl.color}33`,
            borderRadius: 6, padding: "4px 12px",
          }}>
            {sl.text}
          </span>

          {/* Boutons */}
          {isDone ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate(`/scans/${scanId}`)}
                style={{
                  background: "#161b22", border: "1px solid #30363d",
                  color: "#9ca3af", borderRadius: 8, padding: "7px 14px",
                  cursor: "pointer", fontSize: 13,
                }}
              >Voir l'historique →</button>
              <button
                onClick={() => {
                  fetch(`/api/scans/${scanId}/report`, {
                    headers: { Authorization: `Bearer ${token}` },
                  }).then(r => r.text()).then(html => {
                    const w = window.open(); w.document.write(html);
                  }).catch(() => alert("Rapport non disponible"));
                }}
                style={{
                  background: "#0e7490", border: "none",
                  color: "#fff", borderRadius: 8, padding: "7px 14px",
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}
              >⬇ Télécharger le rapport</button>
            </div>
          ) : (
            <button
              onClick={stopScan}
              style={{
                background: "#dc2626", border: "none",
                color: "#fff", borderRadius: 8, padding: "7px 16px",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}
            >■ Arrêter le scan</button>
          )}
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 20,
        alignItems: "start",
      }}>

        {/* GAUCHE : pipeline agents */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Barre de progression globale */}
          <div style={{
            background: "#161b22", border: "1px solid #30363d",
            borderRadius: 10, padding: "14px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>Progression du pipeline</span>
              <span style={{ fontSize: 13, color: "#22d3ee", fontWeight: 600 }}>
                {AGENTS.filter(a => agentStates[a.id].status === "done").length} / {AGENTS.length} agents
              </span>
            </div>
            <div style={{ background: "#0d1117", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(AGENTS.filter(a => agentStates[a.id].status === "done").length / AGENTS.length) * 100}%`,
                background: "linear-gradient(90deg, #0891b2, #22c55e)",
                borderRadius: 4,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Cartes agents */}
          {AGENTS.map((agent, idx) => {
            const state  = agentStates[agent.id];
            const cs     = cardStyle(state.status);
            const isIdle = state.status === "idle";

            return (
              <div key={agent.id} style={{
                background: cs.bg,
                border: `1px solid ${cs.border}`,
                borderRadius: 10,
                padding: "16px 18px",
                opacity: isIdle ? 0.45 : 1,
                transition: "all 0.35s ease",
                position: "relative",
              }}>
                {/* Ligne de connexion verticale (sauf dernier) */}
                {idx < AGENTS.length - 1 && (
                  <div style={{
                    position: "absolute", left: 34, bottom: -13,
                    width: 2, height: 13,
                    background: agentStates[AGENTS[idx + 1].id].status !== "idle"
                      ? "#22d3ee" : "#1f2937",
                    transition: "background 0.3s",
                    zIndex: 1,
                  }} />
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Icône + indicateur */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#161b22",
                      border: `1px solid ${cs.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}>
                      {state.status === "done" ? "✓" : agent.icon}
                    </div>
                    {/* Dot animé */}
                    <div style={{
                      position: "absolute", top: -4, right: -4,
                      width: 10, height: 10, borderRadius: "50%",
                      background: cs.dot,
                      animation: state.status === "running" ? "pulse 1.2s infinite" : "none",
                      border: "2px solid #0d1117",
                    }} />
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: isIdle ? "#6b7280" : cs.text }}>
                        {agent.label}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: cs.text,
                        background: cs.bg,
                        border: `1px solid ${cs.border}`,
                        borderRadius: 4, padding: "2px 8px",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {state.status === "idle"    ? "En attente"
                         : state.status === "running" ? "En cours"
                         : state.status === "done"    ? "Terminé"
                         : state.status === "error"   ? "Erreur"
                         : state.status}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                      {agent.desc}
                    </div>

                    {/* Barre de chargement quand en cours */}
                    {state.status === "running" && (
                      <div style={{
                        marginTop: 10, height: 3,
                        background: "#1f2937", borderRadius: 2, overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", width: "40%",
                          background: "#22d3ee",
                          borderRadius: 2,
                          animation: "slide 1.5s ease-in-out infinite",
                        }} />
                      </div>
                    )}

                    {/* Résultats reconnaissance */}
                    {agent.id === "reconnaissance" && recoData && (
                      <div style={{
                        marginTop: 12, background: "#0d1117",
                        border: "1px solid #1f2937", borderRadius: 8, padding: 12,
                      }}>
                        <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 12 }}>
                          <span style={{ color: "#6b7280" }}>Hôte :</span>
                          <span style={{ color: "#22d3ee" }}>{recoData.host}</span>
                          {recoData.latency && <>
                            <span style={{ color: "#6b7280" }}>Latence :</span>
                            <span style={{ color: "#9ca3af" }}>{recoData.latency}</span>
                          </>}
                          <span style={{ color: "#6b7280" }}>Ports ouverts :</span>
                          <span style={{ color: "#22c55e", fontWeight: 600 }}>{recoData.ports_count}</span>
                        </div>
                        {recoData.ports?.length > 0 && (
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr style={{ color: "#6b7280" }}>
                                <th style={{ textAlign: "left", paddingBottom: 4, fontWeight: 500 }}>PORT</th>
                                <th style={{ textAlign: "left", paddingBottom: 4, fontWeight: 500 }}>SERVICE</th>
                                <th style={{ textAlign: "left", paddingBottom: 4, fontWeight: 500 }}>VERSION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recoData.ports.map((p, i) => (
                                <tr key={i}>
                                  <td style={{ color: "#f59e0b", paddingBottom: 3 }}>{p.port}</td>
                                  <td style={{ color: "#60a5fa", paddingBottom: 3 }}>{p.service}</td>
                                  <td style={{ color: "#9ca3af", paddingBottom: 3 }}>{p.version || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* Résultats RAG */}
                    {agent.id === "rag_lookup" && ragData && (
                      <div style={{
                        marginTop: 12, background: "#0d1117",
                        border: "1px solid #1f2937", borderRadius: 8, padding: 12, fontSize: 12,
                      }}>
                        <div style={{ color: "#6b7280", marginBottom: 4 }}>Requête vectorielle :</div>
                        <div style={{ color: "#9ca3af", marginBottom: 10, fontStyle: "italic" }}>{ragData.query}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{
                            background: "#161b22", border: "1px solid #30363d",
                            borderRadius: 5, padding: "3px 10px", color: "#22d3ee", fontWeight: 600,
                          }}>
                            {ragData.cve_id}
                          </span>
                          {ragData.severity && (() => {
                            const sc = SEVERITY_COLOR[ragData.severity?.toLowerCase()] || SEVERITY_COLOR.medium;
                            return (
                              <span style={{
                                background: sc.bg, border: `1px solid ${sc.border}`,
                                borderRadius: 5, padding: "3px 10px",
                                color: sc.text, fontWeight: 600, textTransform: "uppercase",
                              }}>
                                {sc.label} · CVSS {ragData.cvss}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Résultats analyse vulnérabilités */}
                    {agent.id === "vulnerability_analysis" && vulnData && (
                      <div style={{
                        marginTop: 12, background: "#0d1117",
                        border: "1px solid #1f2937", borderRadius: 8, padding: 12, fontSize: 12,
                      }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <span style={{ color: "#6b7280" }}>Score de risque :</span>
                          <span style={{ color: "#f59e0b", fontWeight: 600 }}>{vulnData.risk_score ?? vulnData.cvss}</span>
                          {vulnData.product && <>
                            <span style={{ color: "#6b7280" }}>Produit :</span>
                            <span style={{ color: "#9ca3af" }}>{vulnData.product}</span>
                          </>}
                        </div>
                        {vulnData.summary && (
                          <div style={{ color: "#9ca3af", marginTop: 8 }}>{vulnData.summary}</div>
                        )}
                      </div>
                    )}

                    {/* Résultats exploitation */}
                    {agent.id === "exploitation" && exploitData && (
                      <div style={{
                        marginTop: 12, background: "#0d1117",
                        border: "1px solid #1f2937", borderRadius: 8, padding: 12, fontSize: 12,
                      }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <span style={{ color: "#6b7280" }}>Résultat :</span>
                          <span style={{
                            color: exploitData.success ? "#22c55e" : "#ef4444",
                            fontWeight: 600,
                          }}>
                            {exploitData.success ? "✓ Exploitation réussie" : "✗ Exploitation échouée"}
                          </span>
                        </div>
                        {exploitData.privilege_level && (
                          <div style={{ marginTop: 6 }}>
                            <span style={{ color: "#6b7280" }}>Privilèges obtenus : </span>
                            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{exploitData.privilege_level}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rapport généré */}
                    {agent.id === "report" && state.status === "done" && (
                      <div style={{ marginTop: 10, fontSize: 12, color: "#22c55e" }}>
                        ✓ Rapport enregistré et disponible au téléchargement
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bannière fin de scan */}
          {scanStatus === "completed" && (
            <div style={{
              background: "#052e16", border: "1px solid #166534",
              borderRadius: 10, padding: 18, textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
              <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 16 }}>
                Scan terminé avec succès
              </div>
              {ragData?.cve_id && (
                <div style={{ fontSize: 13, color: "#4ade80", marginTop: 6 }}>
                  {ragData.cve_id} · CVSS {ragData.cvss}
                </div>
              )}
              <button
                onClick={() => navigate(`/scans/${scanId}`)}
                style={{
                  marginTop: 14, background: "#166534", border: "1px solid #22c55e",
                  color: "#22c55e", borderRadius: 8, padding: "8px 20px",
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}
              >Voir les détails →</button>
            </div>
          )}

          {(scanStatus === "failed" || scanStatus === "stopped") && (
            <div style={{
              background: "#2d0a0a", border: "1px solid #7f1d1d",
              borderRadius: 10, padding: 18, textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>
                {scanStatus === "stopped" ? "⛔" : "❌"}
              </div>
              <div style={{ color: "#fca5a5", fontWeight: 700, fontSize: 16 }}>
                {scanStatus === "stopped" ? "Scan arrêté manuellement" : "Scan échoué"}
              </div>
            </div>
          )}
        </div>

        {/* DROITE : terminal */}
        <div style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 10,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "fit-content",
          position: "sticky",
          top: 24,
        }}>
          {/* En-tête terminal */}
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid #30363d",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
            </div>
            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>
              › Sortie en direct
            </span>
          </div>

          {/* Contenu terminal */}
          <div
            ref={termRef}
            style={{
              height: 520,
              overflowY: "auto",
              padding: "14px 16px",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontSize: 12,
              lineHeight: 1.8,
              background: "#0d1117",
            }}
          >
            {lines.length === 0 && (
              <div style={{ color: "#374151" }}>
                En attente du démarrage du scan...
                {scanStatus === "running" && (
                  <span style={{ animation: "blink 1s step-end infinite" }}> █</span>
                )}
              </div>
            )}
            {lines.map((l, i) => (
              <div
                key={i}
                style={{
                  color: lineColor(l.text),
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {l.text}
              </div>
            ))}
            {scanStatus === "running" && lines.length > 0 && (
              <div style={{ color: "#22d3ee", animation: "blink 1s step-end infinite" }}>
                █
              </div>
            )}
          </div>

          {/* Pied de terminal */}
          <div style={{
            padding: "8px 16px",
            borderTop: "1px solid #30363d",
            display: "flex", justifyContent: "space-between",
            background: "#161b22",
          }}>
            <span style={{ fontSize: 11, color: "#4b5563" }}>
              {lines.length} ligne{lines.length !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: 11, color: "#4b5563" }}>
              ID : {scanId?.slice(0, 8)}…
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
