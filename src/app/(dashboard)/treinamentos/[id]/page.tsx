'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Lock, ChevronDown, ChevronUp, Star, Clock, BookOpen, Loader2, CheckCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Video = { titulo: string; url: string }
type Pergunta = { id: string; texto: string; opcoes: string[]; resposta_correta: number }
type Modulo = {
  id: string; titulo: string; videos: Video[]; descricao: string; ordem: number
  tem_avaliacao: boolean; perguntas: Pergunta[]
  progresso: { concluido: boolean; respostas?: number[] } | null
}
type Treinamento = { id: string; titulo: string; categoria: string; carga_horaria: number; pontos_conclusao: number; capa_url?: string }

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

export default function TreinamentoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [treinamento, setTreinamento] = useState<Treinamento | null>(null)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [progresso, setProgresso] = useState<{ percentual: number; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [moduloAberto, setModuloAberto] = useState<number>(0)
  const [videoAtivo, setVideoAtivo] = useState<{ [moduloIdx: number]: number }>({})
  const [avaliando, setAvaliando] = useState<number | null>(null)
  const [respostas, setRespostas] = useState<{ [key: string]: number }>({})
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState<{ corretas: number; total: number } | null>(null)

  async function carregar() {
    const res = await fetch(`/api/treinamentos/${id}`)
    if (!res.ok) { router.push('/treinamentos'); return }
    const data = await res.json()
    setTreinamento(data.treinamento)
    setModulos(data.modulos)
    setProgresso(data.progresso)
    setLoading(false)
    // Abre primeiro módulo não concluído
    const primeiro = data.modulos.findIndex((m: Modulo) => !m.progresso?.concluido)
    setModuloAberto(primeiro >= 0 ? primeiro : 0)
  }

  useEffect(() => { carregar() }, [id])

  async function concluirModulo(idx: number, comAvaliacao: boolean, resps?: number[]) {
    const m = modulos[idx]
    setSalvando(true)
    const res = await fetch(`/api/treinamentos/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modulo_id: m.id, concluido: true, respostas: resps ?? null })
    })
    const data = await res.json()
    setProgresso({ percentual: data.percentual, status: data.status })
    setModulos(prev => prev.map((mod, i) => i === idx ? { ...mod, progresso: { concluido: true } } : mod))
    setAvaliando(null)
    setRespostas({})
    setResultado(null)
    // Abre próximo módulo
    if (idx + 1 < modulos.length) setModuloAberto(idx + 1)
    setSalvando(false)
  }

  function iniciarAvaliacao(idx: number) {
    setRespostas({})
    setResultado(null)
    setAvaliando(idx)
  }

  function enviarAvaliacao(idx: number) {
    const m = modulos[idx]
    const resps = m.perguntas.map((_, pi) => respostas[`${idx}-${pi}`] ?? -1)
    const corretas = resps.filter((r, pi) => r === m.perguntas[pi].resposta_correta).length
    setResultado({ corretas, total: m.perguntas.length })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={20} className="animate-spin text-[#7ED321] mr-2" />
      <span className="text-sm text-gray-500">Carregando treinamento...</span>
    </div>
  )

  if (!treinamento) return null

  const totalModulos = modulos.length
  const concluidos = modulos.filter(m => m.progresso?.concluido).length

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <button onClick={() => router.push('/treinamentos')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
        <ArrowLeft size={15} /> Voltar aos treinamentos
      </button>

      {/* Capa + info */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
        {treinamento.capa_url && (
          <div className="w-full h-52 relative">
            <img src={treinamento.capa_url} alt={treinamento.titulo} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="text-[10px] font-semibold bg-[#7ED321] text-black px-2 py-0.5 rounded-full">{treinamento.categoria}</span>
            </div>
          </div>
        )}
        <div className="p-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{treinamento.titulo}</h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1"><BookOpen size={12} /> {totalModulos} módulos</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {treinamento.carga_horaria}h</span>
            <span className="flex items-center gap-1 text-[#7ED321] font-semibold"><Star size={12} /> {treinamento.pontos_conclusao} pts ao concluir</span>
          </div>
          {/* Barra de progresso */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">{concluidos} de {totalModulos} módulos concluídos</span>
              <span className="text-xs font-bold text-[#7ED321]">{progresso?.percentual ?? 0}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#7ED321] rounded-full transition-all duration-500"
                style={{ width: `${progresso?.percentual ?? 0}%` }} />
            </div>
            {progresso?.status === 'concluido' && (
              <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-[#7ED321]">
                <CheckCircle size={16} /> Treinamento concluído!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-3">
        {modulos.map((m, idx) => {
          const concluido = !!m.progresso?.concluido
          const anterior = idx === 0 || !!modulos[idx - 1]?.progresso?.concluido
          const bloqueado = !anterior && !concluido
          const aberto = moduloAberto === idx
          const vidAtivo = videoAtivo[idx] ?? 0
          const vidAtual = m.videos[vidAtivo]

          return (
            <div key={m.id} className={cn('bg-white border rounded-2xl overflow-hidden transition-all',
              concluido ? 'border-[#7ED321]/40' : aberto ? 'border-gray-300 shadow-sm' : 'border-gray-200')}>

              {/* Header do módulo */}
              <button
                onClick={() => !bloqueado && setModuloAberto(aberto ? -1 : idx)}
                disabled={bloqueado}
                className={cn('w-full flex items-center gap-3 px-5 py-4 text-left transition-colors',
                  bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50/50')}
              >
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold',
                  concluido ? 'bg-[#7ED321] text-white' : 'bg-gray-100 text-gray-600')}>
                  {concluido ? <CheckCircle size={16} /> : bloqueado ? <Lock size={14} /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.titulo}</p>
                  <p className="text-[11px] text-gray-400">{m.videos.length} vídeo{m.videos.length !== 1 ? 's' : ''}{m.tem_avaliacao ? ' · com avaliação' : ''}</p>
                </div>
                {concluido && <span className="text-[10px] font-bold text-[#7ED321] bg-green-50 px-2 py-0.5 rounded-full">Concluído</span>}
                {!bloqueado && (aberto ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />)}
              </button>

              {/* Conteúdo do módulo */}
              {aberto && !bloqueado && (
                <div className="border-t border-gray-100">
                  {/* Player de vídeo */}
                  {m.videos.length > 0 && (
                    <div>
                      {vidAtual && getEmbedUrl(vidAtual.url) ? (
                        <div className="aspect-video bg-black">
                          <iframe
                            src={getEmbedUrl(vidAtual.url)!}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-2">
                          <Play size={32} className="text-gray-500" />
                          <p className="text-xs text-gray-500">Link de vídeo inválido ou não suportado</p>
                          {vidAtual?.url && <a href={vidAtual.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Abrir link →</a>}
                        </div>
                      )}

                      {/* Navegação entre vídeos */}
                      {m.videos.length > 1 && (
                        <div className="flex gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
                          {m.videos.map((v, vi) => (
                            <button key={vi} onClick={() => setVideoAtivo(prev => ({ ...prev, [idx]: vi }))}
                              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                                vidAtivo === vi ? 'bg-[#7ED321] text-black' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#7ED321]')}>
                              <Play size={10} /> {v.titulo || `Vídeo ${vi + 1}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="px-5 py-4">
                    {m.descricao && <p className="text-sm text-gray-600 mb-4">{m.descricao}</p>}

                    {/* Avaliação */}
                    {avaliando === idx ? (
                      <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen size={15} className="text-[#7ED321]" /> Avaliação do módulo
                          </p>
                          {!resultado && (
                            <button onClick={() => setAvaliando(null)} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
                          )}
                        </div>

                        {resultado ? (
                          <div className={cn('rounded-xl p-4 text-center', resultado.corretas === resultado.total ? 'bg-green-50' : 'bg-amber-50')}>
                            <p className="text-2xl font-bold mb-1" style={{ color: resultado.corretas === resultado.total ? '#7ED321' : '#f59e0b' }}>
                              {resultado.corretas}/{resultado.total}
                            </p>
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              {resultado.corretas === resultado.total ? 'Parabéns! Todas corretas!' : `${resultado.corretas} de ${resultado.total} corretas`}
                            </p>
                            <button onClick={() => concluirModulo(idx, true, m.perguntas.map((_, pi) => respostas[`${idx}-${pi}`] ?? -1))}
                              disabled={salvando}
                              className="bg-[#7ED321] text-black text-sm font-bold px-5 py-2 rounded-lg disabled:opacity-60 flex items-center gap-2 mx-auto">
                              {salvando ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                              Concluir módulo
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4">
                              {m.perguntas.map((p, pi) => (
                                <div key={pi}>
                                  <p className="text-sm font-medium text-gray-800 mb-2">{pi + 1}. {p.texto}</p>
                                  <div className="space-y-2">
                                    {p.opcoes.map((opc, oi) => (
                                      <label key={oi} className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                                        respostas[`${idx}-${pi}`] === oi ? 'border-[#7ED321] bg-green-50' : 'border-gray-200 hover:border-gray-300')}>
                                        <input type="radio" name={`q-${idx}-${pi}`} checked={respostas[`${idx}-${pi}`] === oi}
                                          onChange={() => setRespostas(prev => ({ ...prev, [`${idx}-${pi}`]: oi }))}
                                          className="accent-[#7ED321]" />
                                        <span className="text-sm text-gray-700">{opc}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => enviarAvaliacao(idx)}
                              disabled={m.perguntas.some((_, pi) => respostas[`${idx}-${pi}`] === undefined)}
                              className="w-full py-2.5 bg-[#7ED321] text-black text-sm font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 mt-2">
                              <CheckCheck size={14} /> Enviar respostas
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        {concluido ? (
                          <span className="flex items-center gap-1.5 text-sm text-[#7ED321] font-semibold">
                            <CheckCircle size={15} /> Módulo concluído
                          </span>
                        ) : m.tem_avaliacao ? (
                          <button onClick={() => iniciarAvaliacao(idx)}
                            className="bg-[#7ED321] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#6bbf1a] flex items-center gap-2">
                            <BookOpen size={14} /> Fazer avaliação e concluir
                          </button>
                        ) : (
                          <button onClick={() => concluirModulo(idx, false)} disabled={salvando}
                            className="bg-[#7ED321] text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#6bbf1a] disabled:opacity-60 flex items-center gap-2">
                            {salvando ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                            Marcar como concluído
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
