'use client'
import { useState, useEffect, useRef } from 'react'
import { UserPlus, Pencil, Trash2, X, Check, AlertTriangle, Search, Shield, ChevronDown, Plus, BookOpen } from 'lucide-react'

type Profile = { id: string; user_id: string; nome: string; email: string; funcao: string; setor: string; role: string; pontos: number }
type Form = { email: string; password: string; nome: string; funcao: string; setor: string; role: string }
type MyRole = 'gestor' | 'admin' | 'rh'

const emptyForm: Form = { email: '', password: '', nome: '', funcao: '', setor: '', role: 'colaborador' }
const roleColor: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', gestor: 'bg-blue-100 text-blue-700', rh: 'bg-orange-100 text-orange-700', colaborador: 'bg-gray-100 text-gray-600' }

const FUNCOES_DEFAULT = ['Operador', 'Técnico', 'Auxiliar', 'Supervisor', 'Analista', 'Coordenador', 'Gerente', 'Diretor', 'Designer', 'Desenvolvedor']
const SETORES_DEFAULT = ['Produção', 'Qualidade', 'Logística', 'Financeiro', 'RH', 'TI', 'Comercial', 'Marketing', 'Administrativo', 'Operações']

function ComboBox({ label, value, onChange, options, onAddOption }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; onAddOption: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtradas = options.filter(o => o.toLowerCase().includes(busca.toLowerCase()))
  const podeAdicionar = busca.trim() && !options.some(o => o.toLowerCase() === busca.trim().toLowerCase())

  function selecionar(v: string) { onChange(v); setBusca(''); setOpen(false) }
  function adicionar() { if (!busca.trim()) return; onAddOption(busca.trim()); selecionar(busca.trim()) }

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <button type="button" onClick={() => { setOpen(o => !o); setBusca('') }}
        className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm text-left flex items-center justify-between outline-none focus:border-[#7ED321] hover:border-gray-300">
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || `Selecionar ${label.toLowerCase()}...`}</span>
        <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus value={busca} onChange={e => setBusca(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') podeAdicionar ? adicionar() : filtradas[0] && selecionar(filtradas[0]) }}
              placeholder="Buscar ou criar novo..."
              className="w-full h-8 px-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#7ED321]" />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtradas.map(o => (
              <button key={o} type="button" onClick={() => selecionar(o)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${value === o ? 'bg-green-50 text-[#7ED321] font-semibold' : 'text-gray-700'}`}>
                {o}
              </button>
            ))}
            {podeAdicionar && (
              <button type="button" onClick={adicionar}
                className="w-full text-left px-3 py-2 text-sm text-[#7ED321] font-semibold hover:bg-green-50 flex items-center gap-1.5 border-t border-gray-100">
                <Plus size={13} /> Criar "{busca.trim()}"
              </button>
            )}
            {filtradas.length === 0 && !podeAdicionar && (
              <p className="text-xs text-gray-400 text-center py-3">Nenhuma opção encontrada</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [myRole, setMyRole] = useState<MyRole>('rh')
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<'criar' | 'editar' | 'excluir' | 'treinamentos' | null>(null)
  const [selecionado, setSelecionado] = useState<Profile | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [funcoes, setFuncoes] = useState<string[]>(FUNCOES_DEFAULT)
  const [setores, setSetores] = useState<string[]>(SETORES_DEFAULT)

  const isGestor = myRole === 'gestor' || myRole === 'admin'

  // roles que o usuário atual pode criar/editar
  const rolesPermitidas = isGestor
    ? [{ value: 'colaborador', label: 'Colaborador' }, { value: 'rh', label: 'RH' }, { value: 'gestor', label: 'Gestor' }, { value: 'admin', label: 'Administrador' }]
    : [{ value: 'colaborador', label: 'Colaborador' }]

  async function carregar() {
    const res = await fetch('/api/admin/usuarios')
    const data = await res.json()
    if (Array.isArray(data)) {
      setUsuarios(data)
      // extrai funcoes/setores já cadastrados
      const fs = data.map((u: Profile) => u.funcao).filter(Boolean)
      const ss = data.map((u: Profile) => u.setor).filter(Boolean)
      setFuncoes(prev => [...new Set([...prev, ...fs])])
      setSetores(prev => [...new Set([...prev, ...ss])])
    }
    setLoading(false)
  }

  async function carregarMyRole() {
    const res = await fetch('/api/update-profile')
    const data = await res.json()
    if (data?.role) setMyRole(data.role as MyRole)
  }

  useEffect(() => { carregar(); carregarMyRole() }, [])

  function podeGerenciar(u: Profile) {
    // RH só pode gerenciar colaboradores
    if (!isGestor && u.role !== 'colaborador') return false
    return true
  }

  function abrirCriar() {
    setForm({ ...emptyForm, role: isGestor ? 'colaborador' : 'colaborador' })
    setMsg(''); setModal('criar')
  }
  function abrirEditar(u: Profile) {
    setSelecionado(u)
    setForm({ email: u.email, password: '', nome: u.nome, funcao: u.funcao ?? '', setor: u.setor ?? '', role: u.role })
    setMsg(''); setModal('editar')
  }
  function abrirExcluir(u: Profile) { setSelecionado(u); setModal('excluir') }
  function abrirTreinamentos(u: Profile) { setSelecionado(u); setModal('treinamentos') }

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

  const filtrados = usuarios.filter(u =>
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  )

  const roleLabel: Record<string, string> = { admin: 'Administrador', gestor: 'Gestor', rh: 'RH', colaborador: 'Colaborador' }

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
              const pode = podeGerenciar(u)
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
                      {roleLabel[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7ED321] font-semibold text-xs">{u.pontos?.toLocaleString('pt-BR') ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* RH pode atribuir treinamentos a colaboradores */}
                      {u.role === 'colaborador' && (
                        <button onClick={() => abrirTreinamentos(u)} title="Atribuir treinamentos"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-500"><BookOpen size={13} /></button>
                      )}
                      {pode && <button onClick={() => abrirEditar(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#7ED321]"><Pencil size={13} /></button>}
                      {pode && <button onClick={() => abrirExcluir(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={13} /></button>}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">{modal === 'criar' ? 'Novo usuário' : 'Editar usuário'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="João Silva"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="joao@empresa.com" disabled={modal === 'editar'}
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321] disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {modal === 'criar' ? 'Senha' : 'Nova senha (deixe em branco para manter)'}
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
              </div>

              <ComboBox label="Cargo / Função" value={form.funcao} onChange={v => setForm(f => ({ ...f, funcao: v }))}
                options={funcoes} onAddOption={v => setFuncoes(prev => [...prev, v])} />

              <ComboBox label="Setor" value={form.setor} onChange={v => setForm(f => ({ ...f, setor: v }))}
                options={setores} onAddOption={v => setSetores(prev => [...prev, v])} />

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nível de acesso</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  disabled={!isGestor}
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321] disabled:bg-gray-50 disabled:text-gray-400">
                  {rolesPermitidas.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {!isGestor && (
                  <p className="text-[10px] text-gray-400 mt-1">Apenas o Gestor pode alterar o nível de acesso</p>
                )}
              </div>

              {/* Resumo de permissões da role */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">O que este nível pode fazer</p>
                {form.role === 'colaborador' && (
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Ver seus treinamentos atribuídos</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Acumular pontos e conquistas</li>
                    <li className="flex items-center gap-1.5"><span className="text-gray-300">✗</span> Gerenciar outros usuários</li>
                    <li className="flex items-center gap-1.5"><span className="text-gray-300">✗</span> Acessar dashboard e relatórios</li>
                  </ul>
                )}
                {form.role === 'rh' && (
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Cadastrar e excluir colaboradores</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Atribuir treinamentos por usuário</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Ver dashboard e relatórios</li>
                    <li className="flex items-center gap-1.5"><span className="text-gray-300">✗</span> Criar ou editar treinamentos</li>
                    <li className="flex items-center gap-1.5"><span className="text-gray-300">✗</span> Gerenciar RH ou Gestores</li>
                  </ul>
                )}
                {(form.role === 'gestor' || form.role === 'admin') && (
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Acesso total à plataforma</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Criar, editar e excluir treinamentos</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Gerenciar todos os usuários e RH</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#7ED321]">✓</span> Bonificações e configurações</li>
                  </ul>
                )}
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

      {/* Modal atribuir treinamentos */}
      {modal === 'treinamentos' && selecionado && (
        <AtribuirTreinamentosModal usuario={selecionado} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

function AtribuirTreinamentosModal({ usuario, onClose }: { usuario: Profile; onClose: () => void }) {
  const [treinamentos, setTreinamentos] = useState<{ id: string; titulo: string; categoria: string; atribuido: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/treinamentos').then(r => r.json()),
      fetch(`/api/admin/treinamentos-usuario?user_id=${usuario.user_id}`).then(r => r.json())
    ]).then(([todos, atribuidos]) => {
      const ids = new Set((atribuidos ?? []).map((a: { treinamento_id: string }) => a.treinamento_id))
      setTreinamentos((todos ?? []).map((t: { id: string; titulo: string; categoria: string }) => ({ ...t, atribuido: ids.has(t.id) })))
      setLoading(false)
    })
  }, [usuario.user_id])

  function toggle(id: string) {
    setTreinamentos(prev => prev.map(t => t.id === id ? { ...t, atribuido: !t.atribuido } : t))
  }

  async function salvar() {
    setSalvando(true); setMsg('')
    const atribuidos = treinamentos.filter(t => t.atribuido).map(t => t.id)
    const res = await fetch('/api/admin/treinamentos-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: usuario.user_id, treinamento_ids: atribuidos })
    })
    if (res.ok) onClose()
    else setMsg('Erro ao salvar.')
    setSalvando(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Atribuir treinamentos</h2>
            <p className="text-xs text-gray-500 mt-0.5">{usuario.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? <p className="text-sm text-gray-400 text-center py-6">Carregando...</p> : treinamentos.map(t => (
            <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${t.atribuido ? 'border-[#7ED321] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={t.atribuido} onChange={() => toggle(t.id)} className="w-4 h-4 accent-[#7ED321]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.titulo}</p>
                <p className="text-[11px] text-gray-400">{t.categoria}</p>
              </div>
            </label>
          ))}
          {!loading && treinamentos.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum treinamento cadastrado ainda.</p>
          )}
        </div>
        {msg && <p className="text-xs text-red-600 mt-2">{msg}</p>}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
          <button onClick={salvar} disabled={salvando} className="flex-1 py-2 bg-[#7ED321] text-black text-sm font-bold rounded-lg disabled:opacity-60">
            {salvando ? 'Salvando...' : 'Salvar atribuições'}
          </button>
        </div>
      </div>
    </div>
  )
}
