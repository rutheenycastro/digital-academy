'use client'
import { useState } from 'react'
import { ClipboardCheck, ChevronRight, Trophy, Clock, RotateCcw } from 'lucide-react'

const avaliacoes = [
  {
    id: '1', titulo: 'NR-12 — Segurança em Máquinas', categoria: 'Segurança',
    questoes: 10, tempo: 20, pontos: 150, status: 'disponivel',
    perguntas: [
      { q: 'Qual o principal objetivo da NR-12?', ops: ['Aumentar a produção', 'Garantir segurança em máquinas', 'Reduzir custos', 'Treinar operadores'], correta: 1 },
      { q: 'Antes de operar uma máquina, o colaborador deve:', ops: ['Ligar direto', 'Verificar EPIs e dispositivos de segurança', 'Aguardar o gestor', 'Nenhuma das anteriores'], correta: 1 },
      { q: 'O que fazer ao identificar um risco em uma máquina?', ops: ['Ignorar', 'Continuar operando com cuidado', 'Comunicar imediatamente ao responsável', 'Desligar e ir embora'], correta: 2 },
    ]
  },
  { id: '2', titulo: 'Impressora UV — Operação Básica', categoria: 'Impressão', questoes: 8, tempo: 15, pontos: 100, status: 'concluida', nota: 9.0 },
  { id: '3', titulo: 'Router CNC — Fundamentos', categoria: 'Corte', questoes: 12, tempo: 25, pontos: 200, status: 'bloqueada' },
]

export default function AvaliacoesPage() {
  const [fazendo, setFazendo] = useState<string | null>(null)
  const [respostas, setRespostas] = useState<Record<number, number>>({})
  const [resultado, setResultado] = useState<{ nota: number; acertos: number; total: number } | null>(null)
  const [qAtual, setQAtual] = useState(0)

  const avAtual = avaliacoes.find(a => a.id === fazendo)

  function responder(idx: number) {
    if (!avAtual?.perguntas) return
    setRespostas(prev => ({ ...prev, [qAtual]: idx }))
  }

  function finalizar() {
    if (!avAtual?.perguntas) return
    const acertos = avAtual.perguntas.filter((p, i) => respostas[i] === p.correta).length
    const nota = Math.round((acertos / avAtual.perguntas.length) * 10 * 10) / 10
    setResultado({ nota, acertos, total: avAtual.perguntas.length })
  }

  function reiniciar() {
    setFazendo(null)
    setRespostas({})
    setResultado(null)
    setQAtual(0)
  }

  if (fazendo && avAtual?.perguntas) {
    const pergunta = avAtual.perguntas[qAtual]
    const total = avAtual.perguntas.length

    if (resultado) {
      return (
        <div className="max-w-lg mx-auto mt-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${resultado.nota >= 7 ? 'bg-[#7ED321]' : 'bg-red-100'}`}>
              <Trophy size={36} className={resultado.nota >= 7 ? 'text-black' : 'text-red-500'} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{resultado.nota.toFixed(1)}</h2>
            <p className="text-sm text-gray-500 mb-2">{resultado.acertos} de {resultado.total} corretas</p>
            <p className={`text-sm font-semibold mb-6 ${resultado.nota >= 7 ? 'text-[#7ED321]' : 'text-red-500'}`}>
              {resultado.nota >= 7 ? 'Aprovado! Certificado emitido.' : 'Não atingiu a nota mínima (7,0).'}
            </p>
            <button onClick={reiniciar} className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700">
              <RotateCcw size={14} /> Voltar para avaliações
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-lg mx-auto mt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">{avAtual.titulo}</p>
          <p className="text-xs font-semibold text-gray-700">{qAtual + 1}/{total}</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mb-6">
          <div className="h-full bg-[#7ED321] rounded-full transition-all" style={{ width: `${((qAtual + 1) / total) * 100}%` }} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm font-semibold text-gray-900 mb-5 leading-relaxed">{pergunta.q}</p>
          <div className="space-y-2.5">
            {pergunta.ops.map((op, i) => (
              <button
                key={i}
                onClick={() => responder(i)}
                className={`w-full text-left text-xs px-4 py-3 rounded-xl border transition-all ${respostas[qAtual] === i ? 'border-[#7ED321] bg-green-50 text-[#5fa018] font-semibold' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >
                <span className="font-bold mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>{op}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={reiniciar} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
            {respostas[qAtual] !== undefined && (
              qAtual < total - 1
                ? <button onClick={() => setQAtual(q => q + 1)} className="flex items-center gap-1 bg-[#7ED321] text-black text-xs font-bold px-4 py-2 rounded-lg">
                    Próxima <ChevronRight size={13} />
                  </button>
                : <button onClick={finalizar} className="bg-[#7ED321] text-black text-xs font-bold px-4 py-2 rounded-lg">
                    Finalizar
                  </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Avaliações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Teste seus conhecimentos e obtenha certificados.</p>
      </div>

      <div className="space-y-3">
        {avaliacoes.map(a => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${a.status === 'concluida' ? 'bg-[#7ED321]' : a.status === 'bloqueada' ? 'bg-gray-100' : 'bg-gray-900'}`}>
              <ClipboardCheck size={20} className={a.status === 'concluida' ? 'text-black' : a.status === 'bloqueada' ? 'text-gray-300' : 'text-[#7ED321]'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{a.titulo}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-gray-400">{a.questoes} questões</span>
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Clock size={9} /> {a.tempo} min</span>
                <span className="text-[10px] text-[#7ED321] font-semibold">+{a.pontos} pts</span>
                {a.status === 'concluida' && <span className="text-[10px] text-green-600 font-semibold">Nota: {a.nota}</span>}
              </div>
            </div>
            {a.status === 'disponivel' && (
              <button onClick={() => { setFazendo(a.id); setQAtual(0); setRespostas({}) }}
                className="flex items-center gap-1 bg-[#7ED321] text-black text-xs font-bold px-3 py-2 rounded-lg flex-shrink-0">
                Iniciar <ChevronRight size={13} />
              </button>
            )}
            {a.status === 'concluida' && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">Aprovado</span>
            )}
            {a.status === 'bloqueada' && (
              <span className="text-[10px] bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full flex-shrink-0">Bloqueada</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
