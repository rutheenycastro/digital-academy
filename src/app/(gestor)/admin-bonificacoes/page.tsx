'use client'
import { useState, useEffect } from 'react'
import { Gift, Plus, Minus, Search, Star, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

type Profile = { id: string; user_id: string; nome: string; email: string; funcao: string; setor: string; pontos: number }

export default function AdminBonificacoesPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<Profile | null>(null)
  const [operacao, setOperacao] = useState<'adicionar' | 'remover'>('adicionar')
  const [pontos, setPontos] = useState('')
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  async function carregar() {
    const res = await fetch('/api/admin/usuarios')
    const data = await res.json()
    setUsuarios(data ?? [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function aplicar() {
    if (!selecionado || !pontos || Number(pontos) <= 0) return
    setSalvando(true); setMsg(null)
    const res = await fetch('/api/admin/bonificacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selecionado.user_id, pontos: Number(pontos), operacao })
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg({ tipo: 'erro', texto: data.error ?? 'Erro ao aplicar.' })
    } else {
      setMsg({ tipo: 'ok', texto: `${operacao === 'adicionar' ? '+' : '-'}${Number(pontos).toLocaleString('pt-BR')} pontos ${operacao === 'adicionar' ? 'adicionados a' : 'removidos de'} ${selecionado.nome}. Total: ${data.pontos?.toLocaleString('pt-BR')} pts` })
      setPontos(''); setMotivo('')
      carregar()
      setSelecionado(u => u ? { ...u, pontos: data.pontos } : null)
    }
    setSalvando(false)
  }

  const filtrados = usuarios.filter(u => u.nome?.toLowerCase().includes(busca.toLowerCase()) || u.email?.toLowerCase().includes(busca.toLowerCase()))
  const top = [...usuarios].sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0)).slice(0, 5)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Gift size={20} className="text-[#7ED321]" /> Bonificações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Adicione ou remova pontos de colaboradores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Painel de ação */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buscar usuário */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">1. Selecionar colaborador</p>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={busca} onChange={e => { setBusca(e.target.value); setSelecionado(null); setMsg(null) }} placeholder="Buscar por nome ou e-mail..."
                className="w-full h-9 pl-8 pr-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#7ED321]" />
            </div>
            {busca && (
              <div className="border border-gray-100 rounded-lg divide-y divide-gray-50 max-h-48 overflow-y-auto">
                {filtrados.slice(0, 10).map(u => {
                  const iniciais = u.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
                  return (
                    <button key={u.id} onClick={() => { setSelecionado(u); setBusca(''); setMsg(null) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors ${selecionado?.id === u.id ? 'bg-green-50' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.nome}</p>
                        <p className="text-[11px] text-gray-400">{u.email}</p>
                      </div>
                      <span className="ml-auto text-xs text-[#7ED321] font-bold">{u.pontos?.toLocaleString('pt-BR')} pts</span>
                    </button>
                  )
                })}
              </div>
            )}
            {selecionado && !busca && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-[#7ED321] flex-shrink-0">
                  {selecionado.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{selecionado.nome}</p>
                  <p className="text-[11px] text-gray-500">{selecionado.funcao || selecionado.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#7ED321]">{selecionado.pontos?.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-gray-400">pontos atuais</p>
                </div>
                <button onClick={() => { setSelecionado(null); setMsg(null) }} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1">×</button>
              </div>
            )}
          </div>

          {/* Operação */}
          <div className={`bg-white border rounded-xl p-4 transition-opacity ${!selecionado ? 'opacity-40 pointer-events-none' : ''}`} style={{ borderColor: selecionado ? '#e5e7eb' : '#e5e7eb' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">2. Configurar bonificação</p>
            <div className="flex gap-2 mb-4">
              {(['adicionar', 'remover'] as const).map(op => (
                <button key={op} onClick={() => setOperacao(op)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all ${operacao === op
                    ? op === 'adicionar' ? 'bg-[#7ED321] border-[#7ED321] text-black' : 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {op === 'adicionar' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {op === 'adicionar' ? 'Adicionar pontos' : 'Remover pontos'}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade de pontos</label>
                <input type="number" min="1" value={pontos} onChange={e => setPontos(e.target.value)} placeholder="Ex: 500"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Motivo <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: Conclusão do treinamento de segurança"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
              </div>
            </div>
            {msg && (
              <div className={`mt-3 flex items-start gap-2 text-xs px-3 py-2.5 rounded-lg border ${msg.tipo === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                {msg.texto}
              </div>
            )}
            <button onClick={aplicar} disabled={salvando || !selecionado || !pontos || Number(pontos) <= 0}
              className={`w-full mt-4 py-2.5 text-sm font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${operacao === 'adicionar' ? 'bg-[#7ED321] text-black hover:bg-[#6bbf1a]' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {salvando ? 'Aplicando...' : operacao === 'adicionar' ? <><Plus size={14} /> Adicionar pontos</> : <><Minus size={14} /> Remover pontos</>}
            </button>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top 5 pontuação</p>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
          ) : top.map((u, i) => {
            const iniciais = u.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
            const medalha = ['🥇', '🥈', '🥉', '4º', '5º'][i]
            return (
              <div key={u.id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                <span className="text-base w-6 text-center">{medalha}</span>
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{u.nome}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.funcao || u.email}</p>
                </div>
                <span className="text-xs font-bold text-[#7ED321] flex items-center gap-0.5"><Star size={10} />{u.pontos?.toLocaleString('pt-BR')}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
