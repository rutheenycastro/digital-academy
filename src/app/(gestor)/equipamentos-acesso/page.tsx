'use client'
import { useState, useEffect } from 'react'
import { Wrench, CheckCircle, XCircle, Plus, Search, Loader2 } from 'lucide-react'

type Colaborador = { user_id: string; nome: string; funcao: string; setor: string }

const equipamentos = [
  { id: 'impressora-uv', nome: 'Impressora UV', categoria: 'Impressão' },
  { id: 'router-cnc', nome: 'Router CNC', categoria: 'Corte' },
  { id: 'laser-co2', nome: 'Laser CO2', categoria: 'Corte' },
  { id: 'plotter-recorte', nome: 'Plotter de Recorte', categoria: 'Corte' },
  { id: 'laminadora', nome: 'Laminadora', categoria: 'Acabamento' },
  { id: 'bordadeira-cnc', nome: 'Bordadeira CNC', categoria: 'Malharia' },
  { id: 'fargo-dtc1250e', nome: 'FARGO DTC1250e', categoria: 'Impressão de Crachá' },
]

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default function EquipamentosAcessoPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [acesso, setAcesso] = useState<Record<string, Record<string, boolean>>>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [colabSel, setColabSel] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/admin/acesso-equipamentos')
      .then(r => r.json())
      .then(({ colaboradores, acessos }) => {
        setColaboradores(colaboradores ?? [])
        const map: Record<string, Record<string, boolean>> = {}
        for (const a of (acessos ?? [])) {
          if (!map[a.user_id]) map[a.user_id] = {}
          map[a.user_id][a.equipamento_id] = a.liberado
        }
        setAcesso(map)
        setLoading(false)
      })
  }, [])

  async function toggleAcesso(userId: string, equipId: string) {
    const atual = acesso[userId]?.[equipId] ?? false
    const novo = !atual
    setSalvando(`${userId}-${equipId}`)

    setAcesso(prev => ({
      ...prev,
      [userId]: { ...(prev[userId] ?? {}), [equipId]: novo }
    }))

    await fetch('/api/admin/acesso-equipamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, equipamento_id: equipId, liberado: novo })
    })

    setSalvando(null)
  }

  const colabFiltrados = colaboradores.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.setor ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  const colab = colaboradores.find(c => c.user_id === colabSel)
  const totalAcesso = (id: string) => Object.values(acesso[id] ?? {}).filter(Boolean).length

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader2 size={18} className="animate-spin" /> Carregando colaboradores...
    </div>
  )

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Acesso a Equipamentos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Defina quais equipamentos cada colaborador está autorizado a operar.</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Lista de colaboradores */}
        <div className="col-span-2">
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#7ED321]"
              placeholder="Buscar colaborador..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {colabFiltrados.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">Nenhum colaborador encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {colabFiltrados.map(c => (
                <button key={c.user_id} onClick={() => setColabSel(c.user_id)}
                  className={`w-full text-left bg-white border rounded-xl p-3 flex items-center gap-2.5 transition-all ${colabSel === c.user_id ? 'border-[#7ED321] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-[#7ED321] flex-shrink-0">
                    {iniciais(c.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{c.nome}</p>
                    <p className="text-[10px] text-gray-400">{c.setor || c.funcao || '—'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#7ED321]">{totalAcesso(c.user_id)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Painel de acesso */}
        <div className="col-span-3">
          {colab ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-[#7ED321]">
                  {iniciais(colab.nome)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{colab.nome}</p>
                  <p className="text-[11px] text-gray-500">{colab.funcao || '—'} · {colab.setor || '—'}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold text-[#7ED321]">{totalAcesso(colab.user_id)}</p>
                  <p className="text-[10px] text-gray-400">equipamentos</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Equipamentos liberados</p>

              <div className="space-y-2">
                {equipamentos.map(eq => {
                  const liberado = acesso[colab.user_id]?.[eq.id] ?? false
                  const chave = `${colab.user_id}-${eq.id}`
                  const carregando = salvando === chave
                  return (
                    <div key={eq.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${liberado ? 'border-[#7ED321] bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                      <Wrench size={14} className={liberado ? 'text-[#7ED321]' : 'text-gray-300'} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">{eq.nome}</p>
                        <p className="text-[10px] text-gray-400">{eq.categoria}</p>
                      </div>
                      <button onClick={() => toggleAcesso(colab.user_id, eq.id)} disabled={!!salvando}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 ${liberado ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-[#7ED321] text-black hover:bg-[#6bb81c]'}`}>
                        {carregando ? <Loader2 size={11} className="animate-spin" /> : liberado ? <><XCircle size={11} /> Revogar</> : <><Plus size={11} /> Liberar</>}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  O colaborador só terá acesso aos treinamentos e manuais dos equipamentos liberados aqui. Mudanças têm efeito imediato.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl flex items-center justify-center" style={{ minHeight: 300 }}>
              <div className="text-center text-gray-400">
                <Wrench size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Selecione um colaborador</p>
                <p className="text-xs mt-0.5">para gerenciar o acesso</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
