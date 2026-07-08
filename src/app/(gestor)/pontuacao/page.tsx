'use client'
import { useState } from 'react'
import { Star, Plus, Minus, AlertCircle } from 'lucide-react'

const colaboradores = [
  { id: '1', nome: 'Lucas Mendes', iniciais: 'LM', setor: 'Corte CNC', pontos: 1850 },
  { id: '2', nome: 'Ana Lima', iniciais: 'AL', setor: 'Impressão', pontos: 2800 },
  { id: '3', nome: 'Carlos Melo', iniciais: 'CM', setor: 'Acabamento', pontos: 2400 },
  { id: '4', nome: 'Beatriz Souza', iniciais: 'BS', setor: 'Malharia', pontos: 1900 },
  { id: '5', nome: 'Pedro Nunes', iniciais: 'PN', setor: 'Impressão', pontos: 1200 },
]

const motivosAdd = ['Concluiu treinamento', 'Ideia aprovada e executada', 'Destaque do mês', 'Meta de produção atingida', 'Outro']
const motivosDed = ['Falta sem justificativa', 'Atraso', 'Prejuízo ao equipamento', 'Descumprimento de norma', 'Outro']

export default function PontuacaoPage() {
  const [colab, setColab] = useState<typeof colaboradores[0] | null>(null)
  const [tipo, setTipo] = useState<'add' | 'ded'>('add')
  const [motivo, setMotivo] = useState('')
  const [qtd, setQtd] = useState(50)
  const [obs, setObs] = useState('')
  const [lista, setLista] = useState(colaboradores)
  const [historico, setHistorico] = useState<{ nome: string; tipo: string; qtd: number; motivo: string; data: string }[]>([])

  function aplicar() {
    if (!colab || !motivo) return
    setLista(prev => prev.map(c => c.id === colab.id
      ? { ...c, pontos: tipo === 'add' ? c.pontos + qtd : Math.max(0, c.pontos - qtd) }
      : c
    ))
    setHistorico(prev => [{
      nome: colab.nome,
      tipo,
      qtd,
      motivo,
      data: new Date().toLocaleDateString('pt-BR')
    }, ...prev])
    setColab(null)
    setMotivo('')
    setQtd(50)
    setObs('')
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Gestão de Pontuação</h1>
        <p className="text-sm text-gray-500 mt-0.5">Adicione ou deduza pontos dos colaboradores.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Painel de ação */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Lançar pontuação</h2>

          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setTipo('add')} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${tipo === 'add' ? 'border-[#7ED321] bg-green-50 text-[#5fa018]' : 'border-gray-200 text-gray-400'}`}>
              <Plus size={14} /> Adicionar
            </button>
            <button onClick={() => setTipo('ded')} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${tipo === 'ded' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}>
              <Minus size={14} /> Deduzir
            </button>
          </div>

          {/* Colaborador */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Colaborador</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#7ED321]"
              value={colab?.id ?? ''} onChange={e => setColab(lista.find(c => c.id === e.target.value) ?? null)}>
              <option value="">Selecione...</option>
              {lista.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.setor}</option>)}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Motivo</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#7ED321]"
              value={motivo} onChange={e => setMotivo(e.target.value)}>
              <option value="">Selecione...</option>
              {(tipo === 'add' ? motivosAdd : motivosDed).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Pontos</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQtd(q => Math.max(10, q - 10))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300">−</button>
              <input type="number" value={qtd} onChange={e => setQtd(Number(e.target.value))} min={10} step={10}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-gray-900 outline-none focus:border-[#7ED321]" />
              <button onClick={() => setQtd(q => q + 10)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300">+</button>
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Observação (opcional)</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none outline-none focus:border-[#7ED321]"
              rows={2} placeholder="Detalhes adicionais..." value={obs} onChange={e => setObs(e.target.value)} />
          </div>

          {tipo === 'ded' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-600 leading-relaxed">A dedução de pontos será notificada ao colaborador com o motivo informado.</p>
            </div>
          )}

          <button onClick={aplicar} disabled={!colab || !motivo}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${tipo === 'add' ? 'bg-[#7ED321] text-black' : 'bg-red-500 text-white'}`}>
            {tipo === 'add' ? `+${qtd} pts — Confirmar adição` : `-${qtd} pts — Confirmar dedução`}
          </button>
        </div>

        {/* Lista de colaboradores */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Pontuação atual</h2>
          {lista.sort((a, b) => b.pontos - a.pontos).map((c, i) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <span className={`text-xs font-bold w-5 ${i < 3 ? 'text-[#7ED321]' : 'text-gray-300'}`}>{i + 1}</span>
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-[#7ED321]">{c.iniciais}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{c.nome}</p>
                <p className="text-[10px] text-gray-400">{c.setor}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={11} className="text-[#7ED321]" />
                <span className="text-sm font-bold text-gray-900">{c.pontos.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}

          {/* Histórico */}
          {historico.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lançamentos recentes</h3>
              {historico.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-t border-gray-50 first:border-0">
                  <span className={`text-xs font-bold ${h.tipo === 'add' ? 'text-[#7ED321]' : 'text-red-500'}`}>
                    {h.tipo === 'add' ? '+' : '-'}{h.qtd}
                  </span>
                  <span className="text-xs text-gray-700 flex-1">{h.nome}</span>
                  <span className="text-[10px] text-gray-400">{h.motivo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
