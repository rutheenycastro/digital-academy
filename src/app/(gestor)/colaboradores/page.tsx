import { createClient } from '@/lib/supabase/server'
import { UserPlus } from 'lucide-react'

export default async function ColaboradoresPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase.from('profiles').select('*').order('nome')

  const statusBadge = (pontos: number) => {
    if (pontos === 0) return { label: 'Pendente', cls: 'bg-amber-100 text-amber-700' }
    if (pontos >= 500) return { label: 'Ativo', cls: 'bg-green-100 text-green-700' }
    return { label: 'Iniciando', cls: 'bg-blue-100 text-blue-700' }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie e acompanhe o progresso de cada colaborador.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#7ED321] text-black text-xs font-bold px-4 py-2.5 rounded-lg">
          <UserPlus size={14} /> Adicionar colaborador
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {profiles?.map(p => {
          const iniciais = p.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
          const badge = statusBadge(p.pontos)
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-[#7ED321]">{iniciais}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.nome}</p>
                    <p className="text-[10px] text-gray-500">{p.funcao || p.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
                <span>Pontos</span><span className="font-semibold text-[#7ED321]">{p.pontos.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${Math.min(100, (p.pontos / 3000) * 100)}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Setor: <strong className="text-gray-700">{p.setor || '—'}</strong></span>
                <button className="text-[10px] px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-[#7ED321] hover:text-[#5fa018]">Ver perfil</button>
              </div>
            </div>
          )
        })}

        <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#7ED321] transition-colors min-h-36">
          <div className="text-center">
            <UserPlus size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Adicionar colaborador</p>
          </div>
        </div>
      </div>
    </div>
  )
}
