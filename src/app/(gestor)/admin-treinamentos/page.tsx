'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Plus, Pencil, Trash2, X, Check, AlertTriangle, Search, Clock, Star } from 'lucide-react'

type Treinamento = { id: string; titulo: string; categoria: string; carga_horaria: number; pontos_conclusao: number; ativo: boolean; requerido_vale: boolean; obrigatorio: boolean }
type Form = { titulo: string; categoria: string; carga_horaria: string; pontos_conclusao: string; ativo: boolean; requerido_vale: boolean; obrigatorio: boolean }

const emptyForm: Form = { titulo: '', categoria: '', carga_horaria: '1', pontos_conclusao: '100', ativo: true, requerido_vale: false, obrigatorio: false }
const categorias = ['Segurança', 'Qualidade', 'Operações', 'Gestão', 'Compliance', 'Tecnologia', 'RH', 'Financeiro', 'Outros']

export default function AdminTreinamentosPage() {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | 'excluir' | null>(null)
  const [selecionado, setSelecionado] = useState<Treinamento | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

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
    setForm({ titulo: t.titulo, categoria: t.categoria ?? '', carga_horaria: String(t.carga_horaria ?? 1), pontos_conclusao: String(t.pontos_conclusao ?? 100), ativo: t.ativo, requerido_vale: t.requerido_vale, obrigatorio: t.obrigatorio })
    setMsg(''); setModal('editar')
  }
  function abrirExcluir(t: Treinamento) { setSelecionado(t); setModal('excluir') }

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
              {['Título', 'Categoria', 'Carga H.', 'Pontos', 'Status', 'Flags', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">Carregando...</td></tr>
            ) : filtrados.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 max-w-[220px]">
                  <span className="truncate block">{t.titulo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.categoria || '—'}</span>
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
                  <div className="flex gap-1 flex-wrap">
                    {t.obrigatorio && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Obrig.</span>}
                    {t.requerido_vale && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Vale</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => abrirEditar(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7ED321]"><Pencil size={13} /></button>
                    <button onClick={() => abrirExcluir(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modal === 'criar' || modal === 'editar') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">{modal === 'criar' ? 'Novo treinamento' : 'Editar treinamento'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nome do treinamento"
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
              {msg && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{msg}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="flex-1 py-2 bg-[#7ED321] text-black text-sm font-bold rounded-lg disabled:opacity-60 flex items-center justify-center gap-1.5">
                {salvando ? 'Salvando...' : <><Check size={14} /> Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
