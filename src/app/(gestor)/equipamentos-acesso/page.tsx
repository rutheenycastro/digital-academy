'use client'
import { useState } from 'react'
import { Wrench, CheckCircle, XCircle, Plus, Search } from 'lucide-react'

const colaboradores = [
  { id: '1', nome: 'Lucas Mendes', iniciais: 'LM', setor: 'Corte CNC', funcao: 'Operador CNC' },
  { id: '2', nome: 'Ana Lima', iniciais: 'AL', setor: 'Impressão', funcao: 'Operadora de Impressão' },
  { id: '3', nome: 'Carlos Melo', iniciais: 'CM', setor: 'Acabamento', funcao: 'Acabamento' },
  { id: '4', nome: 'Beatriz Souza', iniciais: 'BS', setor: 'Malharia', funcao: 'Operadora de Bordado' },
  { id: '5', nome: 'Pedro Nunes', iniciais: 'PN', setor: 'Impressão', funcao: 'Operador UV' },
]

const equipamentos = [
  { id: '1', nome: 'Impressora UV', categoria: 'Impressão' },
  { id: '2', nome: 'Router CNC', categoria: 'Corte' },
  { id: '3', nome: 'Laser CO2', categoria: 'Corte' },
  { id: '4', nome: 'Plotter de Recorte', categoria: 'Corte' },
  { id: '5', nome: 'Laminadora', categoria: 'Acabamento' },
  { id: '6', nome: 'Bordadeira CNC', categoria: 'Malharia' },
]

// acesso[colaboradorId][equipamentoId] = true/false
const acessoInicial: Record<string, Record<string, boolean>> = {
  '1': { '2': true, '3': true, '4': true },
  '2': { '1': true, '4': true },
  '3': { '5': true },
  '4': { '6': true },
  '5': { '1': true, '4': true },
}

export default function EquipamentosAcessoPage() {
  const [acesso, setAcesso] = useState(acessoInicial)
  const [colabSel, setColabSel] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  function toggleAcesso(colabId: string, equipId: string) {
    setAcesso(prev => ({
      ...prev,
      [colabId]: {
        ...(prev[colabId] ?? {}),
        [equipId]: !(prev[colabId]?.[equipId] ?? false)
      }
    }))
  }

  const colabFiltrados = colaboradores.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.setor.toLowerCase().includes(busca.toLowerCase())
  )

  const colab = colaboradores.find(c => c.id === colabSel)
  const totalAcesso = (id: string) => Object.values(acesso[id] ?? {}).filter(Boolean).length

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
          <div className="space-y-2">
            {colabFiltrados.map(c => (
              <button key={c.id} onClick={() => setColabSel(c.id)}
                className={`w-full text-left bg-white border rounded-xl p-3 flex items-center gap-2.5 transition-all ${colabSel === c.id ? 'border-[#7ED321] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-[#7ED321] flex-shrink-0">{c.iniciais}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{c.nome}</p>
                  <p className="text-[10px] text-gray-400">{c.setor}</p>
                </div>
                <span className="text-[10px] font-bold text-[#7ED321]">{totalAcesso(c.id)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Painel de acesso */}
        <div className="col-span-3">
          {colab ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-[#7ED321]">{colab.iniciais}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{colab.nome}</p>
                  <p className="text-[11px] text-gray-500">{colab.funcao} · {colab.setor}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold text-[#7ED321]">{totalAcesso(colab.id)}</p>
                  <p className="text-[10px] text-gray-400">equipamentos</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Equipamentos liberados</p>

              <div className="space-y-2">
                {equipamentos.map(eq => {
                  const liberado = acesso[colab.id]?.[eq.id] ?? false
                  return (
                    <div key={eq.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${liberado ? 'border-[#7ED321] bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                      <Wrench size={14} className={liberado ? 'text-[#7ED321]' : 'text-gray-300'} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">{eq.nome}</p>
                        <p className="text-[10px] text-gray-400">{eq.categoria}</p>
                      </div>
                      <button onClick={() => toggleAcesso(colab.id, eq.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${liberado ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-[#7ED321] text-black hover:bg-[#6bb81c]'}`}>
                        {liberado ? <><XCircle size={11} /> Revogar</> : <><Plus size={11} /> Liberar</>}
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
