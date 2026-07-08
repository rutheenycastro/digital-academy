import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'

export default async function ConquistasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user?.id ?? '').single()
  const { data: todasConquistas } = await supabase.from('conquistas').select('*')
  const { data: minhasConquistas } = await supabase.from('conquistas_usuarios').select('conquista_id').eq('user_id', user?.id ?? '')

  const conquistadas = new Set(minhasConquistas?.map(c => c.conquista_id) ?? [])
  const pontos = profile?.pontos ?? 0

  const nivelInfo = [
    { nome: 'Iniciante', min: 0, max: 499, cor: 'bg-gray-400' },
    { nome: 'Bronze', min: 500, max: 1499, cor: 'bg-amber-600' },
    { nome: 'Prata', min: 1500, max: 2999, cor: 'bg-gray-400' },
    { nome: 'Ouro', min: 3000, max: 9999, cor: 'bg-yellow-500' },
  ]
  const nivelAtual = nivelInfo.find(n => pontos >= n.min && pontos <= n.max) ?? nivelInfo[0]
  const pctNivel = Math.min(100, Math.round(((pontos - nivelAtual.min) / (nivelAtual.max - nivelAtual.min)) * 100))

  const ranking = [
    { nome: profile?.nome ?? 'Você', pontos, iniciais: profile?.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? 'VC' },
    { nome: 'Ana Lima', pontos: 2800, iniciais: 'AL' },
    { nome: 'Carlos Melo', pontos: 2400, iniciais: 'CM' },
    { nome: 'Beatriz Souza', pontos: 1900, iniciais: 'BS' },
    { nome: 'Pedro Nunes', pontos: 1200, iniciais: 'PN' },
  ].sort((a, b) => b.pontos - a.pontos)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Conquistas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Seus badges, nível e ranking da equipe.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Nível atual */}
        <div className="col-span-2 bg-gray-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Nível atual</p>
              <p className="text-2xl font-bold text-[#7ED321]">{nivelAtual.nome}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{pontos.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] text-gray-400">pontos</p>
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full mb-1">
            <div className="h-full rounded-full bg-[#7ED321] transition-all" style={{ width: `${pctNivel}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>{nivelAtual.min.toLocaleString('pt-BR')} pts</span>
            <span>{nivelAtual.max.toLocaleString('pt-BR')} pts</span>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">Ranking</p>
          <div className="space-y-2">
            {ranking.slice(0, 4).map((r, i) => (
              <div key={r.nome} className="flex items-center gap-2">
                <span className={`text-[10px] font-bold w-4 ${i < 3 ? 'text-[#7ED321]' : 'text-gray-400'}`}>{i + 1}</span>
                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-[9px] font-bold text-[#7ED321]">{r.iniciais}</div>
                <span className="text-[10px] text-gray-700 flex-1 truncate">{r.nome}</span>
                <span className="text-[10px] font-bold text-[#7ED321]">{r.pontos.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conquistas */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Badges</h2>
      <div className="grid grid-cols-3 gap-3">
        {todasConquistas?.map(c => {
          const desbloqueada = conquistadas.has(c.id)
          const progresso = c.pontos_necessarios ? Math.min(100, Math.round((pontos / c.pontos_necessarios) * 100)) : null
          return (
            <div key={c.id} className={`bg-white border rounded-xl p-4 text-center transition-all ${desbloqueada ? 'border-[#7ED321]' : 'border-gray-200 opacity-60'}`}>
              <div className={`text-3xl mb-2 ${desbloqueada ? '' : 'grayscale'}`}>{c.icone}</div>
              <p className="text-xs font-semibold text-gray-900 mb-0.5">{c.nome}</p>
              <p className="text-[10px] text-gray-400 leading-tight mb-2">{c.descricao}</p>
              {progresso !== null && !desbloqueada && (
                <>
                  <div className="h-1 bg-gray-100 rounded-full mb-1">
                    <div className="h-full bg-[#7ED321] rounded-full" style={{ width: `${progresso}%` }} />
                  </div>
                  <p className="text-[9px] text-gray-400">{pontos}/{c.pontos_necessarios} pts</p>
                </>
              )}
              {desbloqueada && <p className="text-[9px] text-[#7ED321] font-semibold">Conquistado!</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
