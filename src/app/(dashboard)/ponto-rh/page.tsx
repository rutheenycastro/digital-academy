'use client'
import { useState } from 'react'
import { CalendarDays, Clock, FileText, Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const colaboradores = [
  { id: '1', nome: 'Lucas Mendes', iniciais: 'LM', setor: 'Corte CNC' },
  { id: '2', nome: 'Ana Lima', iniciais: 'AL', setor: 'Impressão' },
  { id: '3', nome: 'Carlos Melo', iniciais: 'CM', setor: 'Acabamento' },
  { id: '4', nome: 'Beatriz Souza', iniciais: 'BS', setor: 'Malharia' },
  { id: '5', nome: 'Pedro Nunes', iniciais: 'PN', setor: 'Impressão' },
]

const diasMes = Array.from({ length: 22 }, (_, i) => i + 1)

type TabType = 'ponto' | 'ocorrencias' | 'documentos'

const ocorrencias = [
  { id: '1', colab: 'Pedro Nunes', tipo: 'falta', data: '01/07/2026', justificado: false, obs: '' },
  { id: '2', colab: 'Carlos Melo', tipo: 'atraso', data: '02/07/2026', justificado: true, obs: 'Trânsito — atestado apresentado' },
  { id: '3', colab: 'Lucas Mendes', tipo: 'falta', data: '30/06/2026', justificado: true, obs: 'Atestado médico' },
]

export default function PontoRHPage() {
  const [tab, setTab] = useState<TabType>('ponto')
  const [colabSel, setColabSel] = useState('')
  const [mes, setMes] = useState('07/2026')
  const [novaOcorrencia, setNovaOcorrencia] = useState({ colab: '', tipo: 'falta', data: '', obs: '', justificado: false })
  const [listaOc, setListaOc] = useState(ocorrencias)
  const [docColab, setDocColab] = useState('')
  const [docTipo, setDocTipo] = useState('holerite')

  const ponto: Record<number, 'presente' | 'falta' | 'falta_just' | 'atraso' | 'folga'> = {
    1: 'presente', 2: 'presente', 3: 'presente', 4: 'presente', 5: 'folga',
    6: 'presente', 7: 'presente', 8: 'falta', 9: 'presente', 10: 'presente',
    11: 'folga', 12: 'presente', 13: 'presente', 14: 'atraso', 15: 'presente',
    16: 'presente', 17: 'presente', 18: 'folga', 19: 'presente', 20: 'presente',
    21: 'presente', 22: 'presente',
  }

  const pontoConfig = {
    presente: { label: 'P', cls: 'bg-green-100 text-green-700' },
    falta: { label: 'F', cls: 'bg-red-100 text-red-700 font-bold' },
    falta_just: { label: 'FJ', cls: 'bg-amber-100 text-amber-700' },
    atraso: { label: 'A', cls: 'bg-orange-100 text-orange-700' },
    folga: { label: '—', cls: 'bg-gray-100 text-gray-400' },
  }

  function adicionarOcorrencia() {
    if (!novaOcorrencia.colab || !novaOcorrencia.data) return
    setListaOc(prev => [{ id: Date.now().toString(), ...novaOcorrencia }, ...prev])
    setNovaOcorrencia({ colab: '', tipo: 'falta', data: '', obs: '', justificado: false })
  }

  const tabs: { id: TabType; label: string; icon: typeof CalendarDays }[] = [
    { id: 'ponto', label: 'Folha de Ponto', icon: CalendarDays },
    { id: 'ocorrencias', label: 'Ocorrências', icon: AlertCircle },
    { id: 'documentos', label: 'Documentos', icon: FileText },
  ]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Ponto & RH</h1>
        <p className="text-sm text-gray-500 mt-0.5">Controle de ponto, ocorrências e documentos dos colaboradores.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* PONTO */}
      {tab === 'ponto' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#7ED321]"
              value={colabSel} onChange={e => setColabSel(e.target.value)}>
              <option value="">Selecione o colaborador</option>
              {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.setor}</option>)}
            </select>
            <input type="text" value={mes} onChange={e => setMes(e.target.value)} placeholder="07/2026"
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-28 outline-none focus:border-[#7ED321]" />
          </div>

          {colabSel ? (
            <>
              <div className="grid grid-cols-11 gap-1.5 mb-4">
                {diasMes.map(d => {
                  const status = ponto[d] ?? 'presente'
                  const cfg = pontoConfig[status]
                  return (
                    <div key={d} className="text-center">
                      <p className="text-[9px] text-gray-400 mb-0.5">{d}</p>
                      <div className={`h-7 rounded-md flex items-center justify-center text-[10px] font-semibold ${cfg.cls}`}>{cfg.label}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 text-[10px] text-gray-500 border-t border-gray-100 pt-3">
                {Object.entries(pontoConfig).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1">
                    <span className={`w-5 h-4 rounded flex items-center justify-center text-[9px] font-semibold ${v.cls}`}>{v.label}</span>
                    {k === 'presente' ? 'Presente' : k === 'falta' ? 'Falta' : k === 'falta_just' ? 'Falta justificada' : k === 'atraso' ? 'Atraso' : 'Folga'}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">Selecione um colaborador para ver a folha de ponto.</p>
          )}
        </div>
      )}

      {/* OCORRÊNCIAS */}
      {tab === 'ocorrencias' && (
        <div className="space-y-4">
          {/* Novo lançamento */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">Lançar ocorrência</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Colaborador</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#7ED321]"
                  value={novaOcorrencia.colab} onChange={e => setNovaOcorrencia(p => ({ ...p, colab: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {colaboradores.map(c => <option key={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Tipo</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#7ED321]"
                  value={novaOcorrencia.tipo} onChange={e => setNovaOcorrencia(p => ({ ...p, tipo: e.target.value }))}>
                  <option value="falta">Falta</option>
                  <option value="atraso">Atraso</option>
                  <option value="advertencia">Advertência</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Data</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#7ED321]"
                  value={novaOcorrencia.data} onChange={e => setNovaOcorrencia(p => ({ ...p, data: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Justificado?</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setNovaOcorrencia(p => ({ ...p, justificado: true }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${novaOcorrencia.justificado ? 'border-[#7ED321] bg-green-50 text-[#5fa018]' : 'border-gray-200 text-gray-400'}`}>Sim</button>
                  <button onClick={() => setNovaOcorrencia(p => ({ ...p, justificado: false }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${!novaOcorrencia.justificado ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}>Não</button>
                </div>
              </div>
            </div>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-3 outline-none focus:border-[#7ED321]"
              placeholder="Observação (atestado, motivo...)" value={novaOcorrencia.obs}
              onChange={e => setNovaOcorrencia(p => ({ ...p, obs: e.target.value }))} />
            <button onClick={adicionarOcorrencia} disabled={!novaOcorrencia.colab || !novaOcorrencia.data}
              className="bg-[#7ED321] text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-40">
              Registrar ocorrência
            </button>
          </div>

          {/* Lista */}
          <div className="space-y-2">
            {listaOc.map(oc => (
              <div key={oc.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                {oc.justificado ? <CheckCircle size={14} className="text-[#7ED321] flex-shrink-0" /> : <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{oc.colab}</p>
                  {oc.obs && <p className="text-[10px] text-gray-400">{oc.obs}</p>}
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${oc.tipo === 'falta' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {oc.tipo.charAt(0).toUpperCase() + oc.tipo.slice(1)}
                </span>
                <span className="text-[10px] text-gray-400">{oc.data}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENTOS */}
      {tab === 'documentos' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">Enviar documento</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Colaborador</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#7ED321]"
                  value={docColab} onChange={e => setDocColab(e.target.value)}>
                  <option value="">Selecione...</option>
                  {colaboradores.map(c => <option key={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Tipo de documento</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#7ED321]"
                  value={docTipo} onChange={e => setDocTipo(e.target.value)}>
                  <option value="holerite">Holerite / Comprovante de pagamento</option>
                  <option value="atestado">Atestado médico</option>
                  <option value="ferias">Aviso de férias</option>
                  <option value="advertencia">Advertência</option>
                  <option value="contrato">Contrato / Aditivo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#7ED321] transition-colors cursor-pointer">
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Clique para selecionar o arquivo</p>
              <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG ou PNG — máx. 10MB</p>
            </div>
            <button disabled={!docColab} className="mt-3 w-full bg-[#7ED321] text-black text-xs font-bold py-2.5 rounded-xl disabled:opacity-40">
              Enviar documento
            </button>
          </div>

          {/* Documentos enviados (mock) */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documentos enviados</h3>
            {[
              { colab: 'Lucas Mendes', tipo: 'Holerite', data: '30/06/2026', arquivo: 'holerite_jun26_lucas.pdf' },
              { colab: 'Ana Lima', tipo: 'Holerite', data: '30/06/2026', arquivo: 'holerite_jun26_ana.pdf' },
              { colab: 'Pedro Nunes', tipo: 'Atestado médico', data: '10/06/2026', arquivo: 'atestado_pedro_jun26.pdf' },
            ].map((d, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 mb-2">
                <FileText size={16} className="text-[#7ED321] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{d.colab} — {d.tipo}</p>
                  <p className="text-[10px] text-gray-400">{d.arquivo}</p>
                </div>
                <span className="text-[10px] text-gray-400">{d.data}</span>
                <button className="text-[10px] text-[#7ED321] font-semibold hover:underline">Baixar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
