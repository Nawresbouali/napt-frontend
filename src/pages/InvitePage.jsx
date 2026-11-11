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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setError(d.detail || "Erreur"); return; }
    setSuccess(true);
    setTimeout(() => navigate("/connexion"), 2500);
  }

  const Shell = ({ children }) => (
    <div className="iv-root">
      <style>{ivCss}</style>
      <div className="iv-aurora"><span className="iv-blob iv-b1" /><span className="iv-blob iv-b2" /><span className="iv-blob iv-b3" /></div>
      <div className="iv-card">{children}</div>
    </div>
  );

  if (error && !inv) return (
    <Shell>
      <div className="iv-center">
        <div className="iv-emoji">❌</div>
        <h2 className="iv-t iv-red">Invitation invalide</h2>
        <p className="iv-p">{error}</p>
        <button className="iv-link" onClick={() => navigate("/connexion")}>Retour à la connexion</button>
      </div>
    </Shell>
  );

  if (!inv) return (
    <Shell><div className="iv-center iv-loading">Vérification de l'invitation…</div></Shell>
  );

  if (success) return (
    <Shell>
      <div className="iv-center">
        <div className="iv-emoji">✅</div>
        <h2 className="iv-t iv-green">Compte créé !</h2>
        <p className="iv-p">Redirection vers la connexion…</p>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <div className="iv-head">
        <div className="iv-logo">N.A.P.T</div>
        <h1 className="iv-t">Créer votre compte</h1>
        <p className="iv-p">Invitation pour <span className="iv-mail">{inv.email}</span></p>
        <span className={"iv-role " + (inv.role === "admin" ? "iv-r-admin" : "iv-r-user")}>Rôle : {inv.role}</span>
      </div>
      <form onSubmit={submit}>
        <label className="iv-lbl">Nom d'utilisateur</label>
        <input className="iv-inp" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="ex : john_doe" />
        <label className="iv-lbl">Mot de passe</label>
        <input className="iv-inp" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 caractères" />
        <label className="iv-lbl">Confirmer le mot de passe</label>
        <input className="iv-inp" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        {error && <div className="iv-err">{error}</div>}
        <button className="iv-go" type="submit" disabled={loading}>{loading ? "Création…" : "Créer mon compte"}</button>
      </form>
    </Shell>
  );
}

const ivCss = `
.iv-root{ font-family:'Inter','Segoe UI',sans-serif; background:#fff; color:#0f172a; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; padding:16px; }
.iv-aurora{ position:fixed; inset:0; overflow:hidden; z-index:0; }
.iv-blob{ position:absolute; border-radius:50%; filter:blur(72px); opacity:.42; }
.iv-b1{ width:460px; height:460px; background:#06b6d4; top:-110px; left:-70px; animation:ivf1 15s ease-in-out infinite; }
.iv-b2{ width:420px; height:420px; background:#6366f1; bottom:-130px; right:-50px; animation:ivf2 17s ease-in-out infinite; }
.iv-b3{ width:340px; height:340px; background:#a78bfa; top:45%; left:55%; animation:ivf3 19s ease-in-out infinite; }
@keyframes ivf1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.12)}}
@keyframes ivf2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-46px,30px) scale(1.16)}}
@keyframes ivf3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-40px) scale(1.06)}}
.iv-card{ position:relative; z-index:2; width:min(420px,94vw); padding:34px 30px; border-radius:24px; background:rgba(255,255,255,.74); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,.9); box-shadow:0 30px 80px -20px rgba(79,70,229,.25); animation:ivrise .8s cubic-bezier(.16,1,.3,1) both; }
@keyframes ivrise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.iv-head{ text-align:center; margin-bottom:22px; }
.iv-logo{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:700; font-size:34px; letter-spacing:-1px; background:linear-gradient(100deg,#6366f1,#06b6d4 60%,#2dd4bf); -webkit-background-clip:text; background-clip:text; color:transparent; margin-bottom:12px; }
.iv-t{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:20px; }
.iv-red{ color:#e11d48; } .iv-green{ color:#0d9488; }
.iv-p{ font-size:13.5px; color:#64748b; margin-top:6px; }
.iv-mail{ color:#0f172a; font-weight:500; }
.iv-role{ display:inline-block; margin-top:10px; font-size:11.5px; padding:3px 11px; border-radius:999px; }
.iv-r-admin{ background:rgba(99,102,241,.12); color:#4f46e5; } .iv-r-user{ background:#eef2f8; color:#64748b; }
.iv-lbl{ display:block; font-size:12.5px; font-weight:500; margin:0 0 6px; }
.iv-inp{ width:100%; height:46px; border:1px solid #e8ecf5; border-radius:12px; padding:0 14px; font-size:14px; background:#fff; outline:none; margin-bottom:14px; color:#0f172a; }
.iv-inp:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.iv-err{ background:rgba(244,63,94,.1); color:#e11d48; border-radius:10px; padding:9px 12px; font-size:12.5px; margin-bottom:12px; }
.iv-go{ width:100%; height:48px; border:none; border-radius:12px; color:#fff; font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:15px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; box-shadow:0 14px 30px -12px rgba(79,70,229,.6); transition:.3s; margin-top:4px; }
.iv-go:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.iv-go:disabled{ opacity:.6; }
.iv-center{ text-align:center; }
.iv-emoji{ font-size:40px; margin-bottom:10px; }
.iv-loading{ color:#64748b; animation:ivblink 1.4s ease-in-out infinite; }
@keyframes ivblink{ 50%{opacity:.5} }
.iv-link{ margin-top:18px; background:none; border:none; color:#6366f1; font-size:13.5px; cursor:pointer; }
.iv-link:hover{ text-decoration:underline; }
`
