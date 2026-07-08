'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; content: string }

const sugestoes = [
  'Como opero a impressora UV com segurança?',
  'Quais EPIs preciso usar no CNC?',
  'O que é NR-12 e como ela me afeta?',
  'Como abrir uma RAC corretamente?',
]

const respostas: Record<string, string> = {
  default: 'Boa pergunta! Posso ajudar com dúvidas sobre treinamentos, equipamentos, segurança (NR-12), RACs e o funcionamento da plataforma. Pode perguntar!'
}

function getResponse(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('impressora') || m.includes('uv')) return 'Para operar a Impressora UV com segurança: 1) Use óculos de proteção UV e luvas. 2) Verifique os cabeçotes antes de ligar. 3) Nunca olhe diretamente para a lâmpada UV. 4) Mantenha ventilação adequada. Quer ver o treinamento completo?'
  if (m.includes('epi') || m.includes('cnc') || m.includes('router')) return 'Na operação do Router CNC são obrigatórios: óculos de segurança, protetor auricular (NR15), luvas de couro e sapato fechado. Nunca opere sem a proteção da mesa ativa. Consulte o módulo "NR-12 Máquinas de Corte" para detalhes.'
  if (m.includes('nr-12') || m.includes('nr12')) return 'A NR-12 é a Norma Regulamentadora de Segurança no Trabalho em Máquinas e Equipamentos. Ela define requisitos mínimos de segurança como dispositivos de parada de emergência, proteções físicas e treinamento obrigatório. Você precisa concluir o módulo NR-12 disponível na plataforma.'
  if (m.includes('rac')) return 'Para abrir uma RAC: 1) Acesse o menu RACs na sidebar. 2) Descreva o risco ou não conformidade encontrada. 3) Defina a prioridade (baixa/média/alta/crítica). 4) O gestor será notificado e definirá o responsável. RACs requeridas pela Vale têm prazo máximo de 72h para resposta.'
  return respostas.default
}

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Olá! Sou o assistente da Digital Academy. Posso tirar dúvidas sobre treinamentos, equipamentos, segurança, RACs e muito mais. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function enviar(texto?: string) {
    const msg = texto ?? input
    if (!msg.trim()) return
    setInput('')
    setMsgs(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setMsgs(prev => [...prev, { role: 'assistant', content: getResponse(msg) }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={18} className="text-[#7ED321]" /> Chat com IA
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Tire dúvidas sobre treinamentos, equipamentos e segurança.</p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto space-y-4 mb-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-gray-900' : 'bg-[#7ED321]'}`}>
              {m.role === 'assistant' ? <Bot size={14} className="text-[#7ED321]" /> : <User size={14} className="text-black" />}
            </div>
            <div className={`max-w-xs rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${m.role === 'assistant' ? 'bg-gray-50 text-gray-800 rounded-tl-none' : 'bg-[#7ED321] text-black rounded-tr-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-[#7ED321]" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      {msgs.length === 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {sugestoes.map(s => (
            <button key={s} onClick={() => enviar(s)} className="text-[10px] border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 hover:border-[#7ED321] hover:text-[#5fa018] transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7ED321] transition-colors"
          placeholder="Escreva sua dúvida..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
        />
        <button
          onClick={() => enviar()}
          disabled={!input.trim() || loading}
          className="bg-[#7ED321] text-black px-4 rounded-xl disabled:opacity-50 hover:bg-[#6bb81c] transition-colors"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
