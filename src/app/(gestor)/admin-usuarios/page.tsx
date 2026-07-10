'use client'
import { useState, useEffect } from 'react'
import { UserPlus, Pencil, Trash2, X, Check, AlertTriangle, Search, Shield } from 'lucide-react'

type Profile = { id: string; user_id: string; nome: string; email: string; funcao: string; setor: string; role: string; pontos: number }
type Form = { email: string; password: string; nome: string; funcao: string; setor: string; role: string }

const emptyForm: Form = { email: '', password: '', nome: '', funcao: '', setor: '', role: 'colaborador' }
const roles = [{ value: 'colaborador', label: 'Colaborador' }, { value: 'gestor', label: 'Gestor' }, { value: 'rh', label: 'RH' }, { value: 'admin', label: 'Administrador' }]
const roleColor: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', gestor: 'bg-blue-100 text-blue-700', rh: 'bg-orange-100 text-orange-700', colaborador: 'bg-gray-100 text-gray-600' }

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | 'excluir' | null>(null)
  const [selecionado, setSelecionado] = useState<Profile | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  async function carregar() {
    const res = await fetch('/api/admin/usuarios')
    const data = await res.json()
    setUsuarios(data ?? [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirCriar() { setForm(emptyForm); setMsg(''); setModal('criar') }
  function abrirEditar(u: Profile) { setSelecionado(u); setForm({ email: u.email, password: '', nome: u.nome, funcao: u.funcao ?? '', setor: u.setor ?? '', role: u.role }); setMsg(''); setModal('editar') }
  function abrirExcluir(u: Profile) { setSelecionado(u); setModal('excluir') }

  async function salvar() {
    setSalvando(true); setMsg('')
    const res = await fetch('/api/admin/usuarios', {
      method: modal === 'criar' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modal === 'editar' ? { ...form, user_id: selecionado?.user_id } : form)
    })
    const data = await res.json()
    if (!res.ok) setMsg(data.error ?? 'Erro ao salvar.')
    else { setModal(null); carregar() }
    setSalvando(false)
  }

  async function excluir() {
    setSalvando(true)
    await fetch('/api/admin/usuarios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: selecionado?.user_id }) })
    setModal(null); carregar(); setSalvando(false)
  }

  const filtrados = usuarios.filter(u => u.nome?.toLowerCase().includes(busca.toLowerCase()) || u.email?.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Shield size={20} className="text-[#7ED321]" /> Gestão de Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">{usuarios.length} usuários cadastrados</p>
        </div>
        <button onClick={abrirCriar} className="flex items-center gap-2 bg-[#7ED321] text-black text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#6bbf1a]">
          <UserPlus size={14} /> Novo usuário
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail..."
          className="w-full h-9 pl-8 pr-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#7ED321]" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Usuário', 'E-mail', 'Função', 'Setor', 'Role', 'Pontos', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">Carregando...</td></tr>
            ) : filtrados.map(u => {
              const iniciais = u.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                      <span className="font-semibold text-gray-900">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.funcao || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.setor || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor[u.role] ?? roleColor.colaborador}`}>
                      {roles.find(r => r.value === u.role)?.label ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7ED321] font-semibold text-xs">{u.pontos?.toLocaleString('pt-BR') ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEditar(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7ED321]"><Pencil size={13} /></button>
                      <button onClick={() => abrirExcluir(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal criar/editar */}
      {(modal === 'criar' || modal === 'editar') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">{modal === 'criar' ? 'Novo usuário' : 'Editar usuário'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nome completo', key: 'nome', type: 'text', placeholder: 'João Silva' },
                { label: 'E-mail', key: 'email', type: 'email', placeholder: 'joao@empresa.com', disabled: modal === 'editar' },
                { label: modal === 'criar' ? 'Senha' : 'Nova senha (deixe em branco para manter)', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Cargo / Função', key: 'funcao', type: 'text', placeholder: 'Operador' },
                { label: 'Setor', key: 'setor', type: 'text', placeholder: 'Produção' },
              ].map(({ label, key, type, placeholder, disabled }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key as keyof Form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} disabled={disabled}
                    className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321] disabled:bg-gray-50 disabled:text-gray-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nível de acesso</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]">
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
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

      {/* Modal excluir */}
      {modal === 'excluir' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Excluir usuário</h2>
            <p className="text-sm text-gray-500 mb-5">Tem certeza que deseja excluir <strong>{selecionado?.nome}</strong>? Esta ação não pode ser desfeita.</p>
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
