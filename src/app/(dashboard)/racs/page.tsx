import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'

const racs = [
  { id: '1', numero: 'RAC-2025-001', titulo: 'Extintor vencido no setor de acabamento', prioridade: 'critica', status: 'concluida', prazo: '10/06/2025', responsavel: 'João Silva', requerido_vale: true },
  { id: '2', numero: 'RAC-2025-002', titulo: 'EPI danificado — luva de proteção CNC', prioridade: 'alta', status: 'em_analise', prazo: '15/07/2025', responsavel: 'Maria Souza', requerido_vale: true },
  { id: '3', numero: 'RAC-2025-003', titulo: 'Piso escorregadio próximo à impressora UV', prioridade: 'media', status: 'aberta', prazo: '20/07/2025', responsavel: 'Você', requerido_vale: false },
]

const prioridadeConfig: Record<string, { label: string; cls: string }> = {
  critica: { label: 'Crítica', cls: 'bg-red-100 text-red-700' },
  alta: { label: 'Alta', cls: 'bg-orange-100 text-orange-700' },
  media: { label: 'Média', cls: 'bg-amber-100 text-amber-700' },
  baixa: { label: 'Baixa', cls: 'bg-gray-100 text-gray-600' },
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; cls: string }> = {
  aberta: { label: 'Aberta', icon: AlertTriangle, cls: 'text-amber-500' },
  em_analise: { label: 'Em análise', icon: Clock, cls: 'text-blue-500' },
  concluida: { label: 'Concluída', icon: CheckCircle, cls: 'text-[#7ED321]' },
}

export default function RacsPage() {
  const abertas = racs.filter(r => r.status !== 'concluida').length

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">RACs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registros de Ação Corretiva — acompanhe prazos e status.</p>
        </div>
        {abertas > 0 && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-lg">
            <AlertTriangle size={13} /> {abertas} RAC{abertas > 1 ? 's' : ''} em aberto
          </div>
        )}
      </div>

      <div className="space-y-3">
        {racs.map(r => {
          const prio = prioridadeConfig[r.prioridade]
          const st = statusConfig[r.status]
          const StatusIcon = st.icon
          return (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon size={13} className={st.cls} />
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.titulo}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-400">{r.numero}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${prio.cls}`}>{prio.label}</span>
                    {r.requerido_vale && <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Vale</span>}
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ml-3 flex-shrink-0 ${r.status === 'concluida' ? 'bg-green-100 text-green-700' : r.status === 'em_analise' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {st.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-2 border-t border-gray-50">
                <span className="flex items-center gap-1"><Clock size={9} /> Prazo: <strong className={`${r.status !== 'concluida' ? 'text-red-500' : 'text-gray-500'}`}>{r.prazo}</strong></span>
                <span>Responsável: <strong className="text-gray-600">{r.responsavel}</strong></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
