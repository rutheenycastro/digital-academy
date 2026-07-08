'use client'
import { useState } from 'react'
import { Lightbulb, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

type Status = 'pendente' | 'aprovada' | 'rejeitada'

interface Ideia {
  id: string
  autor: string
  iniciais: string
  setor: string
  tipo: string
  ideia: string
  data: string
  status: Status
  feedback?: string
}

const tipoColor: Record<string, string> = {
  '5s': 'bg-green-100 text-green-700',
  melhoria: 'bg-blue-100 text-blue-700',
  seguranca: 'bg-red-100 text-red-700',
  producao: 'bg-amber-100 text-amber-700',
}
const tipoLabel: Record<string, string> = { '5s': '5S', melhoria: 'Melhoria', seguranca: 'Segurança', producao: 'Produção' }

export default function IdeiasPendentesPage() {
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [feedbackTexto, setFeedbackTexto] = useState('')
  const [filtro, setFiltro] = useState<'todas' | Status>('pendente')

  const [ideias, setIdeias] = useState<Ideia[]>([
    { id: '1', autor: 'Lucas Mendes', iniciais: 'LM', setor: 'Corte CNC', tipo: '5s', ideia: 'Reorganizar o rack de perfis de corte por espessura para agilizar o setup das máquinas e reduzir o tempo de troca de material.', data: '2h atrás', status: 'pendente' },
    { id: '2', autor: 'Ana Lima', iniciais: 'AL', setor: 'Impressão', tipo: 'melhoria', ideia: 'Criar uma tabela de referência de perfis de cor por cliente fixada ao lado da impressora UV para consulta rápida.', data: '5h atrás', status: 'pendente' },
    { id: '3', autor: 'Carlos Melo', iniciais: 'CM', setor: 'Acabamento', tipo: 'seguranca', ideia: 'Instalar antiderrapante no piso próximo à laminadora pois fica escorregadio com o calor.', data: '1 dia atrás', status: 'pendente' },
    { id: '4', autor: 'Beatriz Souza', iniciais: 'BS', setor: 'Malharia', tipo: 'producao', ideia: 'Organizar as linhas de bordado por cor e número na gaveta para agilizar a troca de bobinas.', data: '2 dias atrás', status: 'aprovada', feedback: 'Ótima ideia! Execute e registre o antes e depois.' },
    { id: '5', autor: 'Pedro Nunes', iniciais: 'PN', setor: 'Impressão', tipo: 'melhoria', ideia: 'Criar um checklist digital de manutenção preventiva semanal da impressora.', data: '3 dias atrás', status: 'rejeitada', feedback: 'Já temos um processo definido para isso. Vamos conversar sobre como melhorar o processo atual.' },
  ])

  function aprovar(id: string) {
    setIdeias(prev => prev.map(i => i.id === id ? { ...i, status: 'aprovada', feedback: feedbackTexto || 'Ideia aprovada! Pode executar.' } : i))
    setFeedbackId(null)
    setFeedbackTexto('')
  }

  function rejeitar(id: string) {
    setIdeias(prev => prev.map(i => i.id === id ? { ...i, status: 'rejeitada', feedback: feedbackTexto || 'Ideia não aprovada no momento.' } : i))
    setFeedbackId(null)
    setFeedbackTexto('')
  }

  const pendentes = ideias.filter(i => i.status === 'pendente').length
  const filtradas = filtro === 'todas' ? ideias : ideias.filter(i => i.status === filtro)

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ideias Pendentes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Avalie e aprove as ideias de melhoria da equipe.</p>
        </div>
        {pendentes > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">
            {pendentes} aguardando análise
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(['pendente', 'aprovada', 'rejeitada', 'todas'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize ${filtro === f ? 'bg-[#7ED321] border-[#7ED321] text-black' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {f === 'pendente' ? `Pendentes (${pendentes})` : f === 'aprovada' ? 'Aprovadas' : f === 'rejeitada' ? 'Rejeitadas' : 'Todas'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtradas.map(ideia => (
          <div key={ideia.id} className={`bg-white border rounded-xl p-4 ${ideia.status === 'pendente' ? 'border-amber-200' : ideia.status === 'aprovada' ? 'border-green-200' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-[#7ED321]">{ideia.iniciais}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{ideia.autor}</p>
                  <p className="text-[10px] text-gray-400">{ideia.setor} · {ideia.data}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${tipoColor[ideia.tipo]}`}>{tipoLabel[ideia.tipo]}</span>
                {ideia.status === 'pendente' && <span className="flex items-center gap-1 text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold"><Clock size={9} /> Pendente</span>}
                {ideia.status === 'aprovada' && <span className="flex items-center gap-1 text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold"><CheckCircle size={9} /> Aprovada</span>}
                {ideia.status === 'rejeitada' && <span className="flex items-center gap-1 text-[9px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-semibold"><XCircle size={9} /> Rejeitada</span>}
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed mb-3">{ideia.ideia}</p>

            {/* Feedback já dado */}
            {ideia.feedback && ideia.status !== 'pendente' && (
              <div className={`text-[11px] px-3 py-2 rounded-lg mb-3 ${ideia.status === 'aprovada' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                <strong>Feedback:</strong> {ideia.feedback}
              </div>
            )}

            {/* Ações para pendentes */}
            {ideia.status === 'pendente' && (
              feedbackId === ideia.id ? (
                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <textarea
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none resize-none focus:border-[#7ED321]"
                    rows={2}
                    placeholder="Deixe um feedback para o colaborador (opcional)..."
                    value={feedbackTexto}
                    onChange={e => setFeedbackTexto(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => aprovar(ideia.id)} className="flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg">
                      <CheckCircle size={12} /> Aprovar
                    </button>
                    <button onClick={() => rejeitar(ideia.id)} className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                      <XCircle size={12} /> Rejeitar
                    </button>
                    <button onClick={() => setFeedbackId(null)} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setFeedbackId(ideia.id)} className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:border-[#7ED321] hover:text-[#5fa018] transition-colors">
                  <Lightbulb size={12} /> Avaliar ideia <ChevronDown size={11} />
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
