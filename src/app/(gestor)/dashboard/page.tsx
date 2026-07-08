import { createClient } from '@/lib/supabase/server'
import { Users, Trophy, AlertTriangle, TrendingUp } from 'lucide-react'

export default async function GestorDashboardPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase.from('profiles').select('*').order('pontos', { ascending: false })
  const { data: racs } = await supabase.from('racs').select('*').neq('status', 'concluida')

  const total = profiles?.length ?? 0
  const ativos = profiles?.filter(p => p.pontos > 0).length ?? 0
  const racsAbertas = racs?.length ?? 0
  const avgPontos = total > 0 ? Math.round((profiles?.reduce((a, p) => a + p.pontos, 0) ?? 0) / total) : 0

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
  const valores = [12, 18, 14, 22, 30, 26]
  const maxVal = Math.max(...valores)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral da equipe em tempo real.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Colaboradores', value: total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Engajados', value: `${total > 0 ? Math.round((ativos / total) * 100) : 0}%`, icon: TrendingUp, color: 'text-[#7ED321]', bg: 'bg-green-50' },
          { label: 'RACs abertas', value: racsAbertas, icon: AlertTriangle, color: racsAbertas > 0 ? 'text-red-500' : 'text-gray-400', bg: racsAbertas > 0 ? 'bg-red-50' : 'bg-gray-50' },
          { label: 'Média de pontos', value: avgPontos.toLocaleString('pt-BR'), icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Gráfico de treinamentos */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Treinamentos concluídos / mês</h2>
          <div className="flex items-end gap-3 h-32">
            {meses.map((m, i) => (
              <div key={m} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-semibold text-gray-600">{valores[i]}</span>
                <div className="w-full bg-[#7ED321] rounded-t-sm transition-all hover:bg-[#6bb81c]" style={{ height: `${(valores[i] / maxVal) * 90}px` }} />
                <span className="text-[9px] text-gray-400">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top colaboradores */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Top colaboradores</h2>
          <div className="space-y-2.5">
            {profiles?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-[#7ED321]' : 'text-gray-300'}`}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-[#7ED321]">
                  {p.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 truncate font-medium">{p.nome}</p>
                  <div className="h-1 bg-gray-100 rounded-full mt-0.5">
                    <div className="h-full bg-[#7ED321] rounded-full" style={{ width: `${Math.min(100, (p.pontos / 3000) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7ED321]">{p.pontos.toLocaleString('pt-BR')}</span>
              </div>
            ))}
            {(!profiles || profiles.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum colaborador ainda.</p>
            )}
          </div>
        </div>
      </div>

      {/* RACs abertas */}
      {racsAbertas > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-500" />
            <h2 className="text-sm font-semibold text-red-700">RACs pendentes de ação</h2>
          </div>
          <p className="text-xs text-red-600">Existem {racsAbertas} RAC(s) em aberto que precisam de atenção. Acesse o menu RACs para detalhes.</p>
        </div>
      )}
    </div>
  )
}
