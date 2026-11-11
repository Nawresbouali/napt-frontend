import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [inv, setInv] = useState(null);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations/${token}`)
      .then(r => r.json())
      .then(d => { if (d.detail) setError(d.detail); else setInv(d); })
      .catch(() => setError("Erreur de connexion"));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 6) { setError("Mot de passe trop court (min 6 caractères)"); return; }
    setLoading(true); setError("");
    const r = await fetch(`/api/invitations/${token}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setError(d.detail || "Erreur"); return; }
    setSuccess(true);
    setTimeout(() => navigate("/connexion"), 2500);
  }

  if (error && !inv) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="bg-[#1e293b] rounded-xl p-8 text-center max-w-sm w-full mx-4">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-red-400 font-bold text-xl mb-2">Invitation invalide</h2>
        <p className="text-slate-400 text-sm">{error}</p>
        <button onClick={() => navigate("/connexion")} className="mt-6 text-sky-400 hover:underline text-sm">Retour à la connexion</button>
      </div>
    </div>
  );

  if (!inv) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-slate-400 animate-pulse">Vérification de l'invitation...</div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="bg-[#1e293b] rounded-xl p-8 text-center max-w-sm w-full mx-4">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-green-400 font-bold text-xl mb-2">Compte créé !</h2>
        <p className="text-slate-400 text-sm">Redirection vers la connexion...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-sky-400 font-bold text-xl">Créer votre compte</h1>
          <p className="text-slate-400 text-sm mt-1">Invitation pour <span className="text-slate-200">{inv.email}</span></p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${inv.role === "admin" ? "bg-purple-900 text-purple-300" : "bg-slate-700 text-slate-300"}`}>
            Rôle : {inv.role}
          </span>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nom d'utilisateur</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500" placeholder="ex: john_doe" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500" placeholder="Min. 6 caractères" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirmer le mot de passe</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500" />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-900/20 rounded px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition text-sm">
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
