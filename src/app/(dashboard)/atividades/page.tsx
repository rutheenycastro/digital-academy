'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ThumbsUp, Send, Lightbulb, CheckCircle, Clock, ImagePlus, X } from 'lucide-react'

const tipos = ['5s', 'melhoria', 'seguranca', 'producao'] as const
const tipoLabel: Record<string, string> = { '5s': '5S', melhoria: 'Melhoria', seguranca: 'Segurança', producao: 'Produção' }
const tipoColor: Record<string, string> = {
  '5s': 'bg-green-100 text-green-700',
  melhoria: 'bg-blue-100 text-blue-700',
  seguranca: 'bg-red-100 text-red-700',
  producao: 'bg-amber-100 text-amber-700'
}

type Fase = 'ideia' | 'aprovada' | 'executada'

interface Post {
  id: string
  autor: string
  iniciais: string
  tipo: string
  ideia: string
  execucao?: string
  fotoAntes?: string
  fotoDepois?: string
  fase: Fase
  data: string
  pontos: number
  curtidas: number
  minhaIdeia?: boolean
}

export default function AtividadesPage() {
  const [ideia, setIdeia] = useState('')
  const [tipoSel, setTipoSel] = useState<string>('5s')
  const [enviando, setEnviando] = useState(false)
  const [executandoId, setExecutandoId] = useState<string | null>(null)
  const [textoExecucao, setTextoExecucao] = useState('')
  const [fotoAntes, setFotoAntes] = useState<string | null>(null)
  const [fotoDepois, setFotoDepois] = useState<string | null>(null)
  const inputAntes = useRef<HTMLInputElement>(null)
  const inputDepois = useRef<HTMLInputElement>(null)

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      autor: 'Você',
      iniciais: 'VC',
      tipo: 'melhoria',
      ideia: 'Criar etiquetas coloridas nos rolos de vinil para identificar o tipo de material rapidamente.',
      execucao: 'Implementei etiquetas coloridas (vermelho=PVC, azul=adesivo, verde=transparente) em todos os rolos. Reduziu o tempo de busca em 5 minutos por turno e evita erros de material.',
      fase: 'executada',
      data: '2 dias atrás',
      pontos: 100,
      curtidas: 9,
      minhaIdeia: true
    },
    {
      id: '2',
      autor: 'Você',
      iniciais: 'VC',
      tipo: '5s',
      ideia: 'Reorganizar o rack de perfis de corte por espessura para agilizar o setup das máquinas.',
      fase: 'aprovada',
      data: '4 dias atrás',
      pontos: 50,
      curtidas: 0,
      minhaIdeia: true
    },
    {
      id: '3',
      autor: 'Fernanda Lima',
      iniciais: 'FL',
      tipo: 'seguranca',
      ideia: 'Verificar validade dos extintores no setor de acabamento.',
      execucao: 'Identificou extintor com validade vencida. RAC aberta e extintor substituído imediatamente. Criou planilha de controle mensal.',
      fase: 'executada',
      data: '1 semana atrás',
      pontos: 75,
      curtidas: 14
    },
  ])

  function handleFoto(tipo: 'antes' | 'depois', file: File) {
    const url = URL.createObjectURL(file)
    if (tipo === 'antes') setFotoAntes(url)
    else setFotoDepois(url)
  }

  async function publicarIdeia() {
    if (!ideia.trim()) return
    setEnviando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('atividades').insert({
        user_id: user.id,
        tipo: tipoSel,
        titulo: ideia.slice(0, 80),
        descricao: ideia,
        pontos: 50,
        aprovado: false
      })
      if (!error) {
        setPosts(prev => [{
          id: Date.now().toString(),
          autor: 'Você',
          iniciais: 'VC',
          tipo: tipoSel,
          ideia,
          fase: 'ideia',
          data: 'agora',
          pontos: 50,
          curtidas: 0,
          minhaIdeia: true
        }, ...prev])
        setIdeia('')
      }
    }
    setEnviando(false)
  }

  function registrarExecucao(id: string) {
    if (!textoExecucao.trim()) return
    setPosts(prev => prev.map(p =>
      p.id === id ? {
        ...p,
        fase: 'executada',
        execucao: textoExecucao,
        fotoAntes: fotoAntes ?? undefined,
        fotoDepois: fotoDepois ?? undefined,
        pontos: 100
      } : p
    ))
    setExecutandoId(null)
    setTextoExecucao('')
    setFotoAntes(null)
    setFotoDepois(null)
  }

  const postsPublicos = posts.filter(p => p.fase === 'executada')
  const meusPostsPendentes = posts.filter(p => p.minhaIdeia && p.fase !== 'executada')

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Ideia e Ação</h1>
      <p className="text-sm text-gray-500 mb-5">Registre suas ideias de melhoria. Após aprovação, execute e compartilhe o antes e depois com a equipe.</p>

      {/* Como funciona */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Lightbulb, label: '1. Registre sua ideia', desc: 'Descreva sua sugestão de melhoria', color: 'text-amber-500' },
          { icon: CheckCircle, label: '2. Gestor aprova', desc: 'RH ou gestor valida e libera', color: 'text-blue-500' },
          { icon: ImagePlus, label: '3. Execute e registre', desc: 'Foto do antes e depois + resumo', color: 'text-[#7ED321]' },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <Icon size={18} className={`${color} mx-auto mb-1.5`} />
            <p className="text-[10px] font-semibold text-gray-900 mb-0.5">{label}</p>
            <p className="text-[9px] text-gray-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Formulário nova ideia */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-gray-900">Registrar nova ideia</span>
        </div>
        <textarea
          className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm text-gray-900 resize-none outline-none focus:border-[#7ED321] transition-colors"
          rows={3}
          placeholder="Descreva sua ideia de melhoria. O que, onde e qual o benefício esperado..."
          value={ideia}
          onChange={e => setIdeia(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {tipos.map(t => (
              <button
                key={t}
                onClick={() => setTipoSel(t)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border transition-all ${tipoSel === t ? 'border-[#7ED321] bg-green-50 text-[#5fa018]' : 'border-gray-200 bg-white text-gray-500'}`}
              >
                {tipoLabel[t]}
              </button>
            ))}
          </div>
          <button
            onClick={publicarIdeia}
            disabled={enviando || !ideia.trim()}
            className="flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            <Send size={12} /> Enviar ideia
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Sua ideia será analisada pelo gestor/RH antes de ser executada.</p>
      </div>

      {/* Minhas ideias pendentes */}
      {meusPostsPendentes.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Minhas ideias em andamento</h2>
          <div className="space-y-3">
            {meusPostsPendentes.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${tipoColor[p.tipo]}`}>{tipoLabel[p.tipo]}</span>
                  {p.fase === 'ideia' && (
                    <span className="flex items-center gap-1 text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                      <Clock size={9} /> Aguardando aprovação
                    </span>
                  )}
                  {p.fase === 'aprovada' && (
                    <span className="flex items-center gap-1 text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle size={9} /> Aprovada — execute agora!
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 mb-3">{p.ideia}</p>

                {p.fase === 'aprovada' && (
                  executandoId === p.id ? (
                    <div className="border border-[#7ED321] rounded-xl p-4 bg-green-50 space-y-3">
                      <p className="text-xs font-semibold text-gray-800">Registrar execução da melhoria</p>

                      {/* Fotos antes e depois */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Antes */}
                        <div>
                          <p className="text-[10px] font-semibold text-gray-600 mb-1.5">📷 Foto — ANTES</p>
                          {fotoAntes ? (
                            <div className="relative">
                              <img src={fotoAntes} alt="Antes" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                              <button onClick={() => setFotoAntes(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => inputAntes.current?.click()}
                              className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#7ED321] hover:bg-white transition-colors"
                            >
                              <ImagePlus size={20} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">Adicionar foto</span>
                            </button>
                          )}
                          <input ref={inputAntes} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFoto('antes', e.target.files[0])} />
                        </div>

                        {/* Depois */}
                        <div>
                          <p className="text-[10px] font-semibold text-gray-600 mb-1.5">📷 Foto — DEPOIS</p>
                          {fotoDepois ? (
                            <div className="relative">
                              <img src={fotoDepois} alt="Depois" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                              <button onClick={() => setFotoDepois(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => inputDepois.current?.click()}
                              className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#7ED321] hover:bg-white transition-colors"
                            >
                              <ImagePlus size={20} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">Adicionar foto</span>
                            </button>
                          )}
                          <input ref={inputDepois} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFoto('depois', e.target.files[0])} />
                        </div>
                      </div>

                      {/* Resumo */}
                      <div>
                        <p className="text-[10px] font-semibold text-gray-600 mb-1.5">Descreva o que foi feito e o resultado:</p>
                        <textarea
                          className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs text-gray-900 resize-none outline-none focus:border-[#7ED321]"
                          rows={3}
                          placeholder="O que executei, como fiz, qual foi o impacto real para a equipe..."
                          value={textoExecucao}
                          onChange={e => setTextoExecucao(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => registrarExecucao(p.id)}
                          disabled={!textoExecucao.trim()}
                          className="flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Publicar para a equipe · +50 pts
                        </button>
                        <button onClick={() => { setExecutandoId(null); setFotoAntes(null); setFotoDepois(null) }} className="text-xs text-gray-400 hover:text-gray-600">cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExecutandoId(p.id)}
                      className="flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      <ImagePlus size={12} /> Registrar execução
                    </button>
                  )
                )}
                <p className="text-[10px] text-gray-400 mt-2">{p.data}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed público */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Melhorias realizadas pela equipe</h2>
        <div className="space-y-4">
          {postsPublicos.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[11px] font-bold text-[#7ED321] flex-shrink-0">{p.iniciais}</div>
                <div>
                  <span className="text-xs font-semibold text-gray-900">{p.autor}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${tipoColor[p.tipo]}`}>{tipoLabel[p.tipo]}</span>
                    <span className="text-[9px] text-gray-400">{p.data}</span>
                  </div>
                </div>
              </div>

              {/* Antes e depois */}
              {(p.fotoAntes || p.fotoDepois) && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {p.fotoAntes && (
                    <div>
                      <p className="text-[9px] font-semibold text-gray-500 mb-1">ANTES</p>
                      <img src={p.fotoAntes} alt="Antes" className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                  {p.fotoDepois && (
                    <div>
                      <p className="text-[9px] font-semibold text-[#7ED321] mb-1">DEPOIS</p>
                      <img src={p.fotoDepois} alt="Depois" className="w-full h-36 object-cover rounded-lg border border-[#7ED321]" />
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-gray-400 italic mb-1">Ideia: "{p.ideia}"</p>
              <p className="text-xs text-gray-700 leading-relaxed mb-3">{p.execucao}</p>

              <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-2 border-t border-gray-50">
                <span className="text-[#7ED321] font-semibold">+{p.pontos} pts</span>
                <button className="flex items-center gap-1 border border-gray-200 rounded-md px-2 py-0.5 hover:border-[#7ED321] hover:text-[#7ED321] transition-colors">
                  <ThumbsUp size={11} /> {p.curtidas}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
