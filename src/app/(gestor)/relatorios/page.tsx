import { createClient } from '@/lib/supabase/server'
import { Download } from 'lucide-react'

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const [{ data: profiles }, { data: progressos }, { data: racs }] = await Promise.all([
    supabase.from('profiles').select('*').order('pontos', { ascending: false }),
    supabase.from('progresso_treinamentos').select('*, treinamento:treinamentos(titulo)'),
    supabase.from('racs').select('*').neq('status', 'concluida'),
  ])

  const totalColabs = profiles?.length ?? 0
  const concluiuAlgo = profiles?.filter(p => p.pontos > 0).length ?? 0
  const pctOk = totalColabs > 0 ? Math.round((concluiuAlgo / totalColabs) * 100) : 0
  const racsAbertas = racs?.length ?? 0
  const avgPontos = totalColabs > 0 ? Math.round((profiles?.reduce((a, p) => a + p.pontos, 0) ?? 0) / totalColabs) : 0

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
  const valores = [4, 6, 9, 7, 12, 8]
  const maxVal = Math.max(...valores)

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral do desempenho e progresso da equipe.</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-xs px-3 py-2 rounded-lg hover:bg-gray-50">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Colaboradores', value: totalColabs },
          { label: 'Treinamentos ok', value: `${pctOk}%`, green: true },
          { label: 'RACs abertas', value: racsAbertas, red: racsAbertas > 0 },
          { label: 'Média de pontos', value: avgPontos.toLocaleString('pt-BR') },
        ].map(({ label, value, green, red }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-[10px] text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${green ? 'text-[#7ED321]' : red ? 'text-red-500' : 'text-gray-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Conclusões por mês</h2>
          <div className="flex items-flex-end gap-3 h-28 items-end">
            {meses.map((m, i) => (
              <div key={m} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-semibold text-gray-600">{valores[i]}</span>
                <div className="w-full bg-[#7ED321] rounded-t-sm" style={{ height: `${(valores[i] / maxVal) * 80}px` }} />
                <span className="text-[9px] text-gray-400">{m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Ranking geral</h2>
          <div className="space-y-2">
            {profiles?.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <span className={`text-xs font-bold w-5 ${i < 3 ? 'text-[#7ED321]' : 'text-gray-400'}`}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-[#7ED321]">
                  {p.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 truncate">{p.nome}</p>
                </div>
                <span className="text-xs font-bold text-[#7ED321]">{p.pontos.toLocaleString('pt-BR')}</span>
                <span className="text-sm">{['🥇','🥈','🥉'][i] ?? ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Desempenho individual</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-[10px] text-gray-400">
              <th className="text-left pb-3 font-medium">Colaborador</th>
              <th className="text-left pb-3 font-medium">Função</th>
              <th className="pb-3 font-medium">Progresso</th>
              <th className="text-center pb-3 font-medium">Pontos</th>
              <th className="text-right pb-3 font-medium">Nível</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map(p => (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-900">{p.nome}</td>
                <td className="text-gray-500">{p.funcao || '—'}</td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${Math.min(100, (p.pontos / 3000) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-8">{Math.min(100, Math.round((p.pontos / 3000) * 100))}%</span>
                  </div>
                </td>
                <td className="text-center font-bold text-[#7ED321]">{p.pontos.toLocaleString('pt-BR')}</td>
                <td className="text-right text-gray-500">{p.nivel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
