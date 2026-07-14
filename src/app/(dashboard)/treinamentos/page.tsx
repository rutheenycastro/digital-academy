import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Clock, Star, Play, CheckCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function admin() {
  return createAdminClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

export const dynamic = 'force-dynamic'

export default async function TreinamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: treinamentos } = await admin()
    .from('treinamentos')
    .select('*, modulos_treinamento(count)')
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  const { data: progressos } = await admin()
    .from('progresso_treinamentos')
    .select('*')
    .eq('user_id', user!.id)

  const progressoMap = Object.fromEntries(progressos?.map(p => [p.treinamento_id, p]) ?? [])

  const concluidos = progressos?.filter(p => p.status === 'concluido').length ?? 0
  const emAndamento = progressos?.filter(p => p.status === 'em_andamento').length ?? 0

  const lista = (treinamentos ?? []).map((t: Record<string, unknown> & { modulos_treinamento?: { count: number }[] }) => ({
    ...t,
    modulos_count: t.modulos_treinamento?.[0]?.count ?? 0,
  }))

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Meus Treinamentos</h1>
      <p className="text-sm text-gray-500 mb-4">Acompanhe todos os seus cursos e módulos.</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total de cursos', value: lista.length },
          { label: 'Concluídos', value: concluidos, green: true },
          { label: 'Em andamento', value: emAndamento, amber: true },
          { label: 'Disponíveis', value: lista.length - concluidos },
        ].map(({ label, value, green, amber }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-[10px] text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${green ? 'text-[#7ED321]' : amber ? 'text-amber-500' : 'text-gray-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map(t => {
          const p = progressoMap[t.id as string]
          const status = p?.status ?? 'nao_iniciado'
          const percentual = p?.percentual ?? 0

          return (
            <Link key={t.id as string} href={`/treinamentos/${t.id}`}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#7ED321] hover:shadow-md transition-all group">

              {/* Capa */}
              <div className="relative h-36 bg-gray-100">
                {t.capa_url ? (
                  <img src={t.capa_url as string} alt={t.titulo as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={32} className="text-gray-300" />
                  </div>
                )}
                {/* Overlay play */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                    <Play size={16} className="text-gray-800 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                {/* Status badge */}
                {status === 'concluido' && (
                  <div className="absolute top-2 right-2 bg-[#7ED321] text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Concluído
                  </div>
                )}
                {status === 'em_andamento' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Em andamento
                  </div>
                )}
                {t.obrigatorio && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Obrigatório
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs font-semibold text-[#7ED321] mb-1">{t.categoria as string}</p>
                <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{t.titulo as string}</h3>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {t.modulos_count} módulos</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {t.carga_horaria as number}h</span>
                  <span className="flex items-center gap-1 text-[#7ED321] font-semibold"><Star size={11} /> {(t.pontos_conclusao as number).toLocaleString('pt-BR')}</span>
                </div>

                {/* Barra de progresso */}
                {status !== 'nao_iniciado' && (
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>{percentual}% concluído</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7ED321] rounded-full" style={{ width: `${percentual}%` }} />
                    </div>
                  </div>
                )}

                {status === 'nao_iniciado' && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Play size={11} /> Iniciar treinamento
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {lista.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhum treinamento disponível no momento.</p>
        </div>
      )}
    </div>
  )
}
