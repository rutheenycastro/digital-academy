import { createClient } from '@/lib/supabase/server'
import { CheckCircle, Clock, Circle, Play } from 'lucide-react'
import Link from 'next/link'

const statusLabel = { concluido: 'Concluído', em_andamento: 'Em andamento', nao_iniciado: 'Não iniciado' } as const
const statusColor = { concluido: 'bg-green-100 text-green-700', em_andamento: 'bg-blue-100 text-blue-700', nao_iniciado: 'bg-gray-100 text-gray-500' } as const

export default async function TreinamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: treinamentos } = await supabase.from('treinamentos').select('*').eq('ativo', true)
  const { data: progressos } = await supabase.from('progresso_treinamentos').select('*').eq('user_id', user!.id)

  const progressoMap = Object.fromEntries(progressos?.map(p => [p.treinamento_id, p]) ?? [])

  const concluidos = progressos?.filter(p => p.status === 'concluido').length ?? 0
  const emAndamento = progressos?.filter(p => p.status === 'em_andamento').length ?? 0
  const horas = treinamentos?.reduce((acc, t) => {
    const p = progressoMap[t.id]
    if (!p) return acc
    return acc + Math.round((t.carga_horaria * p.percentual) / 100)
  }, 0) ?? 0

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Meus Treinamentos</h1>
      <p className="text-sm text-gray-500 mb-4">Acompanhe todos os seus cursos e módulos.</p>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total de cursos', value: treinamentos?.length ?? 0 },
          { label: 'Concluídos', value: concluidos, green: true },
          { label: 'Em andamento', value: emAndamento, amber: true },
          { label: 'Horas estudadas', value: `${horas}h` },
        ].map(({ label, value, green, amber }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-[10px] text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${green ? 'text-[#7ED321]' : amber ? 'text-amber-500' : 'text-gray-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {treinamentos?.map(t => {
          const p = progressoMap[t.id]
          const status = (p?.status ?? 'nao_iniciado') as keyof typeof statusLabel
          return (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl flex items-center gap-3 px-4 py-3 hover:border-[#7ED321] transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                <Play size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.titulo}</p>
                <p className="text-[10px] text-gray-400">{t.categoria} · {t.carga_horaria}h · {t.pontos_conclusao} pts</p>
                {p && p.status === 'em_andamento' && (
                  <div className="h-1 bg-gray-100 rounded-full mt-1.5 w-48">
                    <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${p.percentual}%` }} />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[status]}`}>
                  {statusLabel[status]}
                </span>
                {t.requerido_vale && <span className="text-[9px] text-red-500 font-semibold">Exigido Vale</span>}
                {t.obrigatorio && <span className="text-[9px] text-amber-500 font-semibold">Obrigatório</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
