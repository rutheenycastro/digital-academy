'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ThumbsUp, Send } from 'lucide-react'

const tipos = ['5s', 'melhoria', 'seguranca', 'producao'] as const
const tipoLabel: Record<string, string> = { '5s': '5S', melhoria: 'Melhoria', seguranca: 'Segurança', producao: 'Produção' }
const tipoColor: Record<string, string> = { '5s': 'bg-green-100 text-green-700', melhoria: 'bg-blue-100 text-blue-700', seguranca: 'bg-red-100 text-red-700', producao: 'bg-amber-100 text-amber-700' }

export default function AtividadesPage() {
  const [texto, setTexto] = useState('')
  const [tipoSel, setTipoSel] = useState<string[]>(['5s'])
  const [enviando, setEnviando] = useState(false)
  const [atividades, setAtividades] = useState([
    { id: '1', autor: 'Lucas Mendes', iniciais: 'LM', tipo: '5s', texto: 'Reorganizei o rack de perfis de corte por espessura. Reduziu o tempo de setup em 8 min por turno.', data: '3 dias atrás', pontos: 50, curtidas: 6 },
    { id: '2', autor: 'Marcos Ribeiro', iniciais: 'MR', tipo: 'melhoria', texto: 'Sugeri etiquetas coloridas nos rolos de vinil por tipo de material. Aprovado pelo RH, implementação em 15/07.', data: '5 dias atrás', pontos: 50, curtidas: 9 },
    { id: '3', autor: 'Fernanda Lima', iniciais: 'FL', tipo: 'seguranca', texto: 'Identificou extintor com validade vencida no setor de acabamento. RAC aberta e extintor substituído.', data: '1 semana atrás', pontos: 75, curtidas: 14 },
  ])

  function toggleTipo(t: string) {
    setTipoSel(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function publicar() {
    if (!texto.trim()) return
    setEnviando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('atividades').insert({ user_id: user.id, tipo: tipoSel[0] ?? '5s', titulo: texto.slice(0, 80), descricao: texto, pontos: 50 })
      if (!error) {
        setAtividades(prev => [{ id: Date.now().toString(), autor: 'Você', iniciais: 'VC', tipo: tipoSel[0] ?? '5s', texto, data: 'agora', pontos: 50, curtidas: 0 }, ...prev])
        setTexto('')
      }
    }
    setEnviando(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Minhas Atividades</h1>
      <p className="text-sm text-gray-500 mb-4">Melhorias 5S, RACs e ações que você registrou.</p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-3">
          <textarea
            className="w-full bg-transparent border-none outline-none text-sm text-gray-900 resize-none leading-relaxed"
            rows={3}
            placeholder="Registre uma melhoria, ação 5S ou sugestão para a empresa..."
            value={texto}
            onChange={e => setTexto(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              {tipos.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTipo(t)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border transition-all ${tipoSel.includes(t) ? 'border-[#7ED321] bg-green-50 text-[#5fa018]' : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  {tipoLabel[t]}
                </button>
              ))}
            </div>
            <button onClick={publicar} disabled={enviando || !texto.trim()} className="flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50">
              <Send size={12} /> Publicar · +50 pts
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {atividades.map(a => (
          <div key={a.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[11px] font-bold text-[#7ED321] flex-shrink-0">{a.iniciais}</div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl rounded-tl-none p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-900">{a.autor}</span>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${tipoColor[a.tipo]}`}>{tipoLabel[a.tipo]}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{a.texto}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span>{a.data}</span>
                <span className="text-[#7ED321] font-semibold">+{a.pontos} pts</span>
                <button className="flex items-center gap-1 border border-gray-200 rounded-md px-2 py-0.5 hover:border-[#7ED321] hover:text-[#7ED321]">
                  <ThumbsUp size={11} /> {a.curtidas}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
