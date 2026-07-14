'use client'
import { useState, useEffect, useRef } from 'react'
import { BookOpen, Plus, Pencil, Trash2, X, Check, AlertTriangle, Search, Clock, Star, Video, ChevronDown, ChevronUp, GripVertical, HelpCircle, Image, Upload, Loader2, Link2 } from 'lucide-react'

type Video = { titulo: string; url: string }
type Treinamento = { id: string; titulo: string; categoria: string; carga_horaria: number; pontos_conclusao: number; ativo: boolean; requerido_vale: boolean; obrigatorio: boolean; capa_url?: string; modulos_count?: number; modulos?: Modulo[] }
type Modulo = { id?: string; titulo: string; videos: Video[]; descricao: string; ordem: number; tem_avaliacao: boolean; perguntas?: Pergunta[] }
type Pergunta = { id?: string; texto: string; opcoes: string[]; resposta_correta: number }
type Form = { titulo: string; categoria: string; carga_horaria: string; pontos_conclusao: string; ativo: boolean; requerido_vale: boolean; obrigatorio: boolean; capa_url: string }

const emptyForm: Form = { titulo: '', categoria: '', carga_horaria: '1', pontos_conclusao: '100', ativo: true, requerido_vale: false, obrigatorio: false, capa_url: '' }
const categorias = ['Segurança', 'Qualidade', 'Operações', 'Gestão', 'Compliance', 'Tecnologia', 'RH', 'Financeiro', 'Equipamentos', 'Outros']

function emptyModulo(ordem: number): Modulo {
  return { titulo: '', videos: [{ titulo: '', url: '' }], descricao: '', ordem, tem_avaliacao: false, perguntas: [] }
}
function emptyPergunta(): Pergunta {
  return { texto: '', opcoes: ['', '', '', ''], resposta_correta: 0 }
}

export default function AdminTreinamentosPage() {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | 'excluir' | 'modulos' | null>(null)
  const [selecionado, setSelecionado] = useState<Treinamento | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function carregar() {
    const res = await fetch('/api/admin/treinamentos')
    const data = await res.json()
    setTreinamentos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirCriar() { setForm(emptyForm); setMsg(''); setModal('criar') }
  function abrirEditar(t: Treinamento) {
    setSelecionado(t)
    setForm({ titulo: t.titulo, categoria: t.categoria ?? '', carga_horaria: String(t.carga_horaria ?? 1), pontos_conclusao: String(t.pontos_conclusao ?? 100), ativo: t.ativo, requerido_vale: t.requerido_vale, obrigatorio: t.obrigatorio, capa_url: t.capa_url ?? '' })
    setMsg(''); setModal('editar')
  }
  function abrirExcluir(t: Treinamento) { setSelecionado(t); setModal('excluir') }
  function abrirModulos(t: Treinamento) { setSelecionado(t); setModal('modulos') }

  async function handleUploadCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/treinamentos/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) setForm(f => ({ ...f, capa_url: data.url }))
    else setMsg(data.error ?? 'Erro ao fazer upload da imagem.')
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function salvar() {
    setSalvando(true); setMsg('')
    const payload = { ...form, carga_horaria: Number(form.carga_horaria), pontos_conclusao: Number(form.pontos_conclusao), ...(modal === 'editar' ? { id: selecionado?.id } : {}) }
    const res = await fetch('/api/admin/treinamentos', {
      method: modal === 'criar' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) setMsg(data.error ?? 'Erro ao salvar.')
    else { setModal(null); carregar() }
    setSalvando(false)
  }

  async function excluir() {
    setSalvando(true)
    await fetch('/api/admin/treinamentos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selecionado?.id }) })
    setModal(null); carregar(); setSalvando(false)
  }

  const filtrados = treinamentos.filter(t => t.titulo?.toLowerCase().includes(busca.toLowerCase()) || t.categoria?.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BookOpen size={20} className="text-[#7ED321]" /> Gestão de Treinamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{treinamentos.length} treinamentos cadastrados</p>
        </div>
        <button onClick={abrirCriar} className="flex items-center gap-2 bg-[#7ED321] text-black text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#6bbf1a]">
          <Plus size={14} /> Novo treinamento
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por título ou categoria..."
          className="w-full h-9 pl-8 pr-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#7ED321]" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Capa', 'Título', 'Categoria', 'Módulos', 'Carga H.', 'Pontos', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-sm text-gray-400">Carregando...</td></tr>
            ) : filtrados.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {t.capa_url ? (
                    <img src={t.capa_url} alt={t.titulo} className="w-16 h-10 object-cover rounded-lg border border-gray-100" />
                  ) : (
                    <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Image size={14} className="text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px]">
                  <span className="truncate block">{t.titulo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.categoria || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => abrirModulos(t)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                    <Video size={12} />{t.modulos_count ?? t.modulos?.length ?? 0} módulos
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-gray-600"><Clock size={11} /> {t.carga_horaria}h</span>
                </td>
                <td className="px-4 py-3 text-[#7ED321] font-semibold text-xs">
                  <span className="flex items-center gap-1"><Star size={11} /> {t.pontos_conclusao?.toLocaleString('pt-BR')}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => abrirModulos(t)} title="Módulos e vídeos" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-500"><Video size={13} /></button>
                    <button onClick={() => abrirEditar(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7ED321]"><Pencil size={13} /></button>
                    <button onClick={() => abrirExcluir(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal criar/editar */}
      {(modal === 'criar' || modal === 'editar') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">{modal === 'criar' ? 'Novo treinamento' : 'Editar treinamento'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                  <Image size={12} /> Capa do treinamento
                </label>
                {form.capa_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={form.capa_url} alt="Capa" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => fileRef.current?.click()}
                        className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-100">
                        <Upload size={12} /> Trocar
                      </button>
                      <button onClick={() => setForm(f => ({ ...f, capa_url: '' }))}
                        className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-600">
                        <Trash2 size={12} /> Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#7ED321] hover:bg-green-50/50 transition-colors group disabled:opacity-60">
                    {uploading ? (
                      <><Loader2 size={22} className="text-[#7ED321] animate-spin" /><span className="text-xs text-gray-500">Enviando...</span></>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#7ED321]/10 flex items-center justify-center transition-colors">
                          <Upload size={18} className="text-gray-400 group-hover:text-[#7ED321]" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 group-hover:text-[#7ED321]">Clique para adicionar uma capa</span>
                        <span className="text-[10px] text-gray-400">JPG, PNG ou WEBP · Max 5MB</span>
                      </>
                    )}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadCapa} className="hidden" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Treinamento Impressora UV"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]">
                  <option value="">Selecionar...</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Carga horária (h)</label>
                  <input type="number" min="1" value={form.carga_horaria} onChange={e => setForm(f => ({ ...f, carga_horaria: e.target.value }))}
                    className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pontos ao concluir</label>
                  <input type="number" min="0" value={form.pontos_conclusao} onChange={e => setForm(f => ({ ...f, pontos_conclusao: e.target.value }))}
                    className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                {([
                  { key: 'ativo', label: 'Treinamento ativo (visível aos colaboradores)' },
                  { key: 'obrigatorio', label: 'Obrigatório' },
                  { key: 'requerido_vale', label: 'Requerido para vale' },
                ] as { key: keyof Form; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form[key] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-[#7ED321]" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {modal === 'criar' && (
                <p className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  Após salvar, clique em <strong>Módulos</strong> para adicionar os vídeos e avaliações.
                </p>
              )}
              {msg && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{msg}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={salvando || uploading} className="flex-1 py-2 bg-[#7ED321] text-black text-sm font-bold rounded-lg disabled:opacity-60 flex items-center justify-center gap-1.5">
                {salvando ? 'Salvando...' : <><Check size={14} /> Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal excluir */}
      {modal === 'excluir' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Excluir treinamento</h2>
            <p className="text-sm text-gray-500 mb-5">Tem certeza que deseja excluir <strong>{selecionado?.titulo}</strong>?</p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
              <button onClick={excluir} disabled={salvando} className="flex-1 py-2 bg-red-500 text-white text-sm font-bold rounded-lg disabled:opacity-60">
                {salvando ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'modulos' && selecionado && (
        <ModulosModal treinamento={selecionado} onClose={() => { setModal(null); carregar() }} />
      )}
    </div>
  )
}

function ModulosModal({ treinamento, onClose }: { treinamento: Treinamento; onClose: () => void }) {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [expandido, setExpandido] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`/api/admin/modulos?treinamento_id=${treinamento.id}`)
      .then(r => r.json())
      .then(data => { setModulos(data ?? []); setLoading(false) })
  }, [treinamento.id])

  function addModulo() {
    const novo = emptyModulo(modulos.length + 1)
    setModulos(prev => [...prev, novo])
    setExpandido(modulos.length)
  }

  function updateModulo(i: number, campo: keyof Modulo, valor: unknown) {
    setModulos(prev => prev.map((m, idx) => idx === i ? { ...m, [campo]: valor } : m))
  }

  function removeModulo(i: number) {
    setModulos(prev => prev.filter((_, idx) => idx !== i).map((m, idx) => ({ ...m, ordem: idx + 1 })))
    setExpandido(null)
  }

  function addVideo(iMod: number) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, videos: [...m.videos, { titulo: '', url: '' }] }
      : m
    ))
  }

  function updateVideo(iMod: number, iVid: number, campo: keyof Video, valor: string) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, videos: m.videos.map((v, vi) => vi === iVid ? { ...v, [campo]: valor } : v) }
      : m
    ))
  }

  function removeVideo(iMod: number, iVid: number) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, videos: m.videos.filter((_, vi) => vi !== iVid) }
      : m
    ))
  }

  function addPergunta(iMod: number) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, perguntas: [...(m.perguntas ?? []), emptyPergunta()] }
      : m
    ))
  }

  function updatePergunta(iMod: number, iPerg: number, campo: keyof Pergunta, valor: unknown) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, perguntas: (m.perguntas ?? []).map((p, pi) => pi === iPerg ? { ...p, [campo]: valor } : p) }
      : m
    ))
  }

  function updateOpcao(iMod: number, iPerg: number, iOpc: number, valor: string) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, perguntas: (m.perguntas ?? []).map((p, pi) => pi === iPerg
          ? { ...p, opcoes: p.opcoes.map((o, oi) => oi === iOpc ? valor : o) }
          : p)
        }
      : m
    ))
  }

  function removePergunta(iMod: number, iPerg: number) {
    setModulos(prev => prev.map((m, idx) => idx === iMod
      ? { ...m, perguntas: (m.perguntas ?? []).filter((_, pi) => pi !== iPerg) }
      : m
    ))
  }

  async function salvar() {
    setSalvando(true); setMsg('')
    const res = await fetch('/api/admin/modulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ treinamento_id: treinamento.id, modulos })
    })
    if (res.ok) onClose()
    else setMsg('Erro ao salvar módulos.')
    setSalvando(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Módulos do treinamento</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{treinamento.titulo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? <p className="text-sm text-gray-400 text-center py-8">Carregando...</p> : (
            <>
              {modulos.map((m, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header do módulo */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                    <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-[#7ED321] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <input value={m.titulo} onChange={e => updateModulo(i, 'titulo', e.target.value)}
                      placeholder={`Módulo ${i + 1} — ex: Introdução à Impressora UV`}
                      className="flex-1 text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400" />
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{m.videos.length} vídeo{m.videos.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => setExpandido(expandido === i ? null : i)} className="text-gray-400 hover:text-gray-600">
                      {expandido === i ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button onClick={() => removeModulo(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>

                  {expandido === i && (
                    <div className="px-4 py-4 space-y-4">

                      {/* Seção de vídeos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                            <Video size={12} className="text-[#7ED321]" /> Vídeos do módulo
                          </label>
                          <button onClick={() => addVideo(i)}
                            className="flex items-center gap-1 text-[11px] text-[#7ED321] font-semibold hover:underline">
                            <Plus size={11} /> Adicionar vídeo
                          </button>
                        </div>

                        <div className="space-y-2">
                          {m.videos.map((v, vi) => (
                            <div key={vi} className="bg-gray-50 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 w-5 text-center flex-shrink-0">{vi + 1}</span>
                                <input value={v.titulo} onChange={e => updateVideo(i, vi, 'titulo', e.target.value)}
                                  placeholder="Título do vídeo (opcional)"
                                  className="flex-1 h-8 border border-gray-200 rounded-lg px-2.5 text-xs outline-none focus:border-[#7ED321] bg-white" />
                                {m.videos.length > 1 && (
                                  <button onClick={() => removeVideo(i, vi)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 pl-7">
                                <Link2 size={12} className="text-gray-400 flex-shrink-0" />
                                <input value={v.url} onChange={e => updateVideo(i, vi, 'url', e.target.value)}
                                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                                  className="flex-1 h-8 border border-gray-200 rounded-lg px-2.5 text-xs outline-none focus:border-[#7ED321] bg-white" />
                              </div>
                              {v.url && (
                                <div className="pl-7">
                                  <a href={v.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:underline">
                                    Testar link →
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Descrição */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Descrição (opcional)</label>
                        <textarea value={m.descricao} onChange={e => updateModulo(i, 'descricao', e.target.value)}
                          placeholder="O que o colaborador vai aprender neste módulo..."
                          rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7ED321] resize-none" />
                      </div>

                      {/* Avaliação — separada no final */}
                      <div className="border-t border-gray-100 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={m.tem_avaliacao} onChange={e => updateModulo(i, 'tem_avaliacao', e.target.checked)} className="w-4 h-4 accent-[#7ED321]" />
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <HelpCircle size={14} className="text-[#7ED321]" /> Avaliação ao final do módulo
                          </span>
                        </label>

                        {m.tem_avaliacao && (
                          <div className="mt-3 space-y-3 pl-2 border-l-2 border-[#7ED321]/30">
                            <p className="text-[11px] text-gray-500">O colaborador responde essas perguntas após assistir todos os vídeos.</p>
                            {(m.perguntas ?? []).map((p, pi) => (
                              <div key={pi} className="bg-gray-50 rounded-xl p-3 space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="text-[10px] font-bold text-gray-400 mt-2 w-5 flex-shrink-0">{pi + 1}.</span>
                                  <input value={p.texto} onChange={e => updatePergunta(i, pi, 'texto', e.target.value)}
                                    placeholder="Texto da pergunta"
                                    className="flex-1 h-8 border border-gray-200 rounded-lg px-2.5 text-sm outline-none focus:border-[#7ED321]" />
                                  <button onClick={() => removePergunta(i, pi)} className="text-gray-400 hover:text-red-500 mt-1"><Trash2 size={12} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pl-7">
                                  {p.opcoes.map((opc, oi) => (
                                    <label key={oi} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${p.resposta_correta === oi ? 'border-[#7ED321] bg-green-50' : 'border-gray-200'}`}>
                                      <input type="radio" name={`resp-${i}-${pi}`} checked={p.resposta_correta === oi}
                                        onChange={() => updatePergunta(i, pi, 'resposta_correta', oi)} className="accent-[#7ED321] flex-shrink-0" />
                                      <input value={opc} onChange={e => updateOpcao(i, pi, oi, e.target.value)}
                                        placeholder={`Opção ${oi + 1}`} className="text-xs text-gray-700 bg-transparent outline-none w-full" />
                                    </label>
                                  ))}
                                </div>
                                <p className="text-[10px] text-gray-400 pl-7">Selecione o círculo da opção correta</p>
                              </div>
                            ))}
                            <button onClick={() => addPergunta(i)}
                              className="flex items-center gap-1.5 text-xs text-[#7ED321] font-semibold hover:underline pl-2">
                              <Plus size={12} /> Adicionar pergunta
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              ))}

              <button onClick={addModulo}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-[#7ED321] hover:text-[#7ED321] transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Adicionar módulo
              </button>
            </>
          )}
        </div>

        {msg && <p className="text-xs text-red-600 px-6 pb-2">{msg}</p>}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
          <button onClick={salvar} disabled={salvando}
            className="flex-1 py-2 bg-[#7ED321] text-black text-sm font-bold rounded-lg disabled:opacity-60 flex items-center justify-center gap-2">
            {salvando ? 'Salvando...' : <><Check size={14} /> Salvar módulos</>}
          </button>
        </div>
      </div>
    </div>
  )
}
