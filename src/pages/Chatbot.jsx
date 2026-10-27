import { useState, useRef, useEffect } from "react"
import api from "../api"

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant IA en cybersecurite. Posez vos questions sur les vulnerabilites, CVE, ou vos scans.' }
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
      setMessages(prev => [...prev, { role: 'assistant', content: r.data.response || r.data.message || 'Reponse recue.' }])
    } catch(e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion.' }])
    }
    setLoading(false)
  }

  const suggestions = ["Qu est-ce qu une injection SQL ?", "Comment corriger une CVE critique ?", "Explique-moi XSS", "Bonnes pratiques de securite ?"]
  const uname = JSON.parse(localStorage.getItem('napt_user') || '{}').username?.[0]?.toUpperCase() || 'U'

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">Assistant IA Cybersecurite</h1>
        <p className="text-gray-400 text-sm mt-1">Posez vos questions en cybersecurite</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 mr-3 mt-1 flex-shrink-0">🤖</div>}
            <div className={"max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed " + (m.role === 'user' ? 'bg-sky-600 text-white rounded-tr-sm' : 'bg-[#1e293b] text-gray-200 border border-slate-700 rounded-tl-sm')}>
              {m.content}
            </div>
            {m.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold ml-3 mt-1 flex-shrink-0">{uname}</div>}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 mr-3 mt-1">🤖</div>
            <div className="bg-[#1e293b] border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {messages.length === 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} className="text-xs bg-[#1e293b] hover:bg-slate-700 border border-slate-600 text-gray-300 px-3 py-1.5 rounded-full transition">{s}</button>
          ))}
        </div>
      )}
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={envoyer} className="flex gap-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Posez votre question..."
            className="flex-1 bg-[#1e293b] border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500" />
          <button type="submit" disabled={!input.trim() || loading} className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition">➤</button>
        </form>
      </div>
    </div>
  )
}
