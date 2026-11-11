import { useState, useRef, useEffect } from "react"
import api from "../api"

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant IA en cybersécurité. Posez vos questions sur les vulnérabilités, CVE, ou vos scans.' }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const envoyer = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)
    try {
      const r = await api.post('/llm/chat', { message: question })
      setMessages(prev => [...prev, { role: 'assistant', content: r.data.response || r.data.message || 'Réponse reçue.' }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion.' }])
    }
    setLoading(false)
  }

  const suggestions = ["Qu'est-ce qu'une injection SQL ?", "Comment corriger une CVE critique ?", "Explique-moi le XSS", "Bonnes pratiques de sécurité ?"]
  const uname = JSON.parse(localStorage.getItem('napt_user') || '{}').username?.[0]?.toUpperCase() || 'U'

  return (
    <div className="cb-root">
      <style>{cbCss}</style>
      <div className="cb-head">
        <div className="cb-h1">Assistant IA Cybersécurité</div>
        <div className="cb-sub">Posez vos questions en cybersécurité</div>
      </div>

      <div className="cb-msgs">
        {messages.map((m, i) => (
          <div className={"cb-row " + (m.role === 'user' ? 'cb-right' : 'cb-left')} key={i}>
            {m.role === 'assistant' && <div className="cb-av cb-bot">🤖</div>}
            <div className={"cb-bubble " + (m.role === 'user' ? 'cb-bu' : 'cb-ba')}>{m.content}</div>
            {m.role === 'user' && <div className="cb-av cb-me">{uname}</div>}
          </div>
        ))}
        {loading && (
          <div className="cb-row cb-left">
            <div className="cb-av cb-bot">🤖</div>
            <div className="cb-bubble cb-ba cb-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="cb-sugg">
          {suggestions.map((s, i) => (
            <button key={i} className="cb-chip" onClick={() => setInput(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="cb-input-wrap">
        <form className="cb-form" onSubmit={envoyer}>
          <input className="cb-input" type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Posez votre question…" />
          <button className="cb-send" type="submit" disabled={!input.trim() || loading}>➤</button>
        </form>
      </div>
    </div>
  )
}

const cbCss = `
.cb-root{ display:flex; flex-direction:column; height:100%; font-family:'Inter','Segoe UI',sans-serif; color:#0f172a; }
.cb-head{ padding:24px 30px; border-bottom:1px solid #e8ecf5; }
.cb-h1{ font-family:'Space Grotesk','Inter',sans-serif; font-weight:600; font-size:24px; }
.cb-sub{ font-size:13.5px; color:#64748b; margin-top:3px; }
.cb-msgs{ flex:1; overflow-y:auto; padding:24px 30px; display:flex; flex-direction:column; gap:16px; }
.cb-row{ display:flex; align-items:flex-start; gap:10px; }
.cb-left{ justify-content:flex-start; } .cb-right{ justify-content:flex-end; }
.cb-av{ width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; margin-top:2px; }
.cb-bot{ background:rgba(6,182,212,.12); }
.cb-me{ background:linear-gradient(135deg,#6366f1,#06b6d4); color:#fff; font-size:13px; font-weight:600; }
.cb-bubble{ max-width:74%; padding:12px 16px; border-radius:18px; font-size:14px; line-height:1.6; animation:cbpop .3s cubic-bezier(.16,1,.3,1) both; }
@keyframes cbpop{ from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.cb-bu{ background:linear-gradient(100deg,#6366f1,#06b6d4); color:#fff; border-top-right-radius:6px; }
.cb-ba{ background:rgba(255,255,255,.85); backdrop-filter:blur(8px); border:1px solid #e8ecf5; color:#334155; border-top-left-radius:6px; }
.cb-typing{ display:flex; gap:5px; align-items:center; }
.cb-typing span{ width:7px; height:7px; border-radius:50%; background:#06b6d4; animation:cbbounce 1.2s infinite; }
.cb-typing span:nth-child(2){ animation-delay:.15s } .cb-typing span:nth-child(3){ animation-delay:.3s }
@keyframes cbbounce{ 0%,60%,100%{transform:translateY(0);opacity:.5} 30%{transform:translateY(-6px);opacity:1} }
.cb-sugg{ padding:0 30px 10px; display:flex; flex-wrap:wrap; gap:8px; }
.cb-chip{ font-size:12.5px; background:rgba(255,255,255,.85); border:1px solid #e8ecf5; color:#475569; padding:7px 13px; border-radius:999px; cursor:pointer; transition:.2s; }
.cb-chip:hover{ border-color:rgba(99,102,241,.4); color:#4f46e5; transform:translateY(-1px); }
.cb-input-wrap{ padding:16px 30px; border-top:1px solid #e8ecf5; }
.cb-form{ display:flex; gap:12px; }
.cb-input{ flex:1; height:48px; border:1px solid #e8ecf5; border-radius:14px; padding:0 18px; font-size:14px; outline:none; background:rgba(255,255,255,.9); color:#0f172a; }
.cb-input:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }
.cb-send{ width:52px; height:48px; border:none; border-radius:14px; color:#fff; font-size:16px; background:linear-gradient(100deg,#6366f1,#06b6d4); background-size:160% auto; cursor:pointer; transition:.3s; box-shadow:0 12px 26px -12px rgba(79,70,229,.6); }
.cb-send:hover:not(:disabled){ background-position:right center; transform:translateY(-2px); }
.cb-send:disabled{ opacity:.4; cursor:default; }
`
