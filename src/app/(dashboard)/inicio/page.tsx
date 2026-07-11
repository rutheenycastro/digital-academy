import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { calcularNivel, formatPontos } from '@/lib/utils'
import { ArrowRight, Play, Star, Calendar, Users, TrendingUp, BookOpen, Award, UserCheck, UserX, ClipboardList, Gift } from 'lucide-react'
import Link from 'next/link'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

export const dynamic = 'force-dynamic'

export default async function InicioPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await adminClient().from('profiles').select('*').eq('user_id', user!.id).single()
  const role = profile?.role ?? 'colaborador'

  // GESTOR / ADMIN
  if (role === 'gestor' || role === 'admin') {
    const [{ data: colaboradores }, { data: progressos }, { data: treinamentos }] = await Promise.all([
      adminClient().from('profiles').select('*').eq('role', 'colaborador').order('nome'),
      adminClient().from('progresso_treinamentos').select('*, treinamento:treinamentos(titulo), profile:profiles(nome)'),
      adminClient().from('treinamentos').select('id, titulo, ativo').eq('ativo', true),
    ])

    const totalColabs = colaboradores?.length ?? 0
    const concluidos = progressos?.filter(p => p.status === 'concluido').length ?? 0
    const emAndamento = progressos?.filter(p => p.status === 'em_andamento').length ?? 0
    const totalProgressos = progressos?.length ?? 0
    const taxaConclusao = totalProgressos > 0 ? Math.round((concluidos / totalProgressos) * 100) : 0
    const topColabs = [...(colaboradores ?? [])].sort((a, b) => (b.pontos ?? 0) - (a.pontos ?? 0)).slice(0, 5)
    const progressoPorColab = (colaboradores ?? []).map(c => {
      const ps = progressos?.filter(p => p.user_id === c.user_id) ?? []
      const conc = ps.filter(p => p.status === 'concluido').length
      const pct = ps.length > 0 ? Math.round((conc / ps.length) * 100) : 0
      return { ...c, treinamentos_total: ps.length, treinamentos_concluidos: conc, percentual: pct }
    }).sort((a, b) => b.percentual - a.percentual)

    return (
      <div className="grid grid-cols-[1fr_260px] gap-4">
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Colaboradores', value: totalColabs, icon: Users, cor: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Treinamentos ativos', value: treinamentos?.length ?? 0, icon: BookOpen, cor: 'text-[#7ED321]', bg: 'bg-green-50' },
              { label: 'Em andamento', value: emAndamento, icon: TrendingUp, cor: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Taxa de conclusao', value: `${taxaConclusao}%`, icon: Award, cor: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(({ label, value, icon: Icon, cor, bg }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}><Icon size={16} className={cor} /></div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Progresso por colaborador</h2>
              <Link href="/colaboradores" className="text-xs text-[#7ED321] hover:underline">Ver todos</Link>
            </div>
            {progressoPorColab.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum colaborador cadastrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {progressoPorColab.slice(0, 8).map(c => {
                  const iniciais = c.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-900 truncate">{c.nome}</span>
                          <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0">{c.treinamentos_concluidos}/{c.treinamentos_total}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${c.percentual}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-10 text-right">{c.percentual}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {(treinamentos?.length ?? 0) > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900">Treinamentos ativos</h2>
                <Link href="/admin-treinamentos" className="text-xs text-[#7ED321] hover:underline">Gerenciar</Link>
              </div>
              <div className="space-y-2">
                {treinamentos?.slice(0, 5).map(t => {
                  const conc = progressos?.filter(p => p.treinamento_id === t.id && p.status === 'concluido').length ?? 0
                  const tot = progressos?.filter(p => p.treinamento_id === t.id).length ?? 0
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                      <BookOpen size={14} className="text-[#7ED321] flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-900 flex-1 truncate">{t.titulo}</span>
                      <span className="text-[11px] text-gray-500 flex-shrink-0">{conc}/{tot} concluidos</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-3">
              <Star size={14} className="text-[#7ED321]" /> Top colaboradores
            </div>
            {topColabs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Sem dados ainda</p>
            ) : topColabs.map((c, i) => {
              const iniciais = c.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
              const medalha = ['🥇', '🥈', '🥉', '4o', '5o'][i]
              return (
                <div key={c.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm w-5 text-center">{medalha}</span>
                  <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{c.nome}</p>
                    <p className="text-[10px] text-gray-400 truncate">{c.funcao || c.setor || ''}</p>
                  </div>
                  <span className="text-xs font-bold text-[#7ED321]">{(c.pontos ?? 0).toLocaleString('pt-BR')}</span>
                </div>
              )
            })}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-900 mb-3">Atalhos rapidos</p>
            <div className="space-y-2">
              {[
                { href: '/admin-usuarios', label: 'Novo colaborador', icon: Users },
                { href: '/admin-treinamentos', label: 'Novo treinamento', icon: BookOpen },
                { href: '/ideias-pendentes', label: 'Ideias pendentes', icon: TrendingUp },
                { href: '/admin-bonificacoes', label: 'Bonificacoes', icon: Award },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 hover:bg-green-50 hover:text-[#7ED321] transition-colors">
                  <Icon size={13} className="flex-shrink-0" /> {label}
                  <ArrowRight size={11} className="ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RH
  if (role === 'rh') {
    const [{ data: colaboradores }, { data: progressos }, { data: treinamentos }] = await Promise.all([
      adminClient().from('profiles').select('*').eq('role', 'colaborador').order('nome'),
      adminClient().from('progresso_treinamentos').select('*'),
      adminClient().from('treinamentos').select('id, titulo').eq('ativo', true),
    ])

    const totalColabs = colaboradores?.length ?? 0
    const comTreinamentoIds = new Set(progressos?.map(p => p.user_id) ?? [])
    const semTreinamento = (colaboradores ?? []).filter(c => !comTreinamentoIds.has(c.user_id))
    const comTreinamentoCount = totalColabs - semTreinamento.length
    const emAndamentoIds = new Set(progressos?.filter(p => p.status === 'em_andamento').map(p => p.user_id) ?? [])
    const progressoPorColab = (colaboradores ?? []).map(c => {
      const ps = progressos?.filter(p => p.user_id === c.user_id) ?? []
      const conc = ps.filter(p => p.status === 'concluido').length
      const pct = ps.length > 0 ? Math.round((conc / ps.length) * 100) : 0
      return { ...c, treinamentos_total: ps.length, treinamentos_concluidos: conc, percentual: pct }
    })

    return (
      <div className="grid grid-cols-[1fr_260px] gap-4">
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Colaboradores', value: totalColabs, icon: Users, cor: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Com treinamento', value: comTreinamentoCount, icon: UserCheck, cor: 'text-[#7ED321]', bg: 'bg-green-50' },
              { label: 'Sem treinamento', value: semTreinamento.length, icon: UserX, cor: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Em andamento', value: emAndamentoIds.size, icon: TrendingUp, cor: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, cor, bg }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}><Icon size={16} className={cor} /></div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {semTreinamento.length > 0 && (
            <div className="bg-white border border-red-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <UserX size={15} className="text-red-500" />
                  Sem treinamento atribuido
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{semTreinamento.length}</span>
                </h2>
                <Link href="/admin-usuarios" className="text-xs text-[#7ED321] hover:underline">Atribuir</Link>
              </div>
              <div className="space-y-2">
                {semTreinamento.slice(0, 5).map(c => {
                  const iniciais = c.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
                  return (
                    <div key={c.user_id} className="flex items-center gap-3 p-2.5 bg-red-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{c.nome}</p>
                        <p className="text-[10px] text-gray-500 truncate">{c.funcao || c.setor || 'Sem cargo definido'}</p>
                      </div>
                      <span className="text-[10px] text-red-500 font-semibold">Pendente</span>
                    </div>
                  )
                })}
                {semTreinamento.length > 5 && (
                  <p className="text-[11px] text-gray-400 text-center pt-1">+{semTreinamento.length - 5} colaboradores</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Progresso por colaborador</h2>
              <Link href="/colaboradores" className="text-xs text-[#7ED321] hover:underline">Ver todos</Link>
            </div>
            {progressoPorColab.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum colaborador cadastrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {progressoPorColab.slice(0, 8).map(c => {
                  const iniciais = c.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
                  return (
                    <div key={c.user_id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-[#7ED321] flex-shrink-0">{iniciais}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-900 truncate">{c.nome}</span>
                          <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0">{c.treinamentos_concluidos}/{c.treinamentos_total}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${c.percentual}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-10 text-right">{c.percentual}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-3">
              <BookOpen size={14} className="text-[#7ED321]" /> Treinamentos ativos
            </div>
            {(treinamentos?.length ?? 0) === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Nenhum treinamento ativo</p>
            ) : (
              <div className="space-y-2">
                {treinamentos?.slice(0, 6).map(t => {
                  const atribuidos = progressos?.filter(p => p.treinamento_id === t.id).length ?? 0
                  return (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <p className="text-xs text-gray-900 truncate flex-1">{t.titulo}</p>
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{atribuidos} alunos</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-900 mb-3">Atalhos rapidos</p>
            <div className="space-y-2">
              {[
                { href: '/admin-usuarios', label: 'Novo colaborador', icon: Users },
                { href: '/admin-usuarios', label: 'Atribuir treinamento', icon: ClipboardList },
                { href: '/ponto-rh', label: 'Ponto e RH', icon: Calendar },
                { href: '/admin-bonificacoes', label: 'Bonificacoes', icon: Gift },
                { href: '/ideias-pendentes', label: 'Ideias pendentes', icon: TrendingUp },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700 hover:bg-green-50 hover:text-[#7ED321] transition-colors">
                  <Icon size={13} className="flex-shrink-0" /> {label}
                  <ArrowRight size={11} className="ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // COLABORADOR
  const [{ data: progressos }, { data: racs }] = await Promise.all([
    supabase.from('progresso_treinamentos').select('*, treinamento:treinamentos(titulo,categoria)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('racs').select('*').eq('user_id', user!.id).eq('status', 'aberta').order('prazo'),
  ])

  const nivel = calcularNivel(profile?.pontos ?? 0)
  const concluidos = progressos?.filter(p => p.status === 'concluido').length ?? 0
  const total = progressos?.length ?? 0
  const percentualGeral = total > 0 ? Math.round((concluidos / total) * 100) : 0
  const emAndamento2 = progressos?.find(p => p.status === 'em_andamento')

  return (
    <div className="grid grid-cols-[1fr_256px] gap-4">
      <div>
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Seu progresso geral</p>
            <p className="text-4xl font-bold text-[#7ED321] leading-none">{percentualGeral}%</p>
            <p className="text-xs text-gray-500 mt-1">Voce concluiu {concluidos} de {total} modulos</p>
            <div className="h-1.5 bg-gray-700 rounded-full mt-3 w-56">
              <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${percentualGeral}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-[#7ED321] flex items-center justify-center text-3xl mx-auto mb-1.5">{nivel.icone}</div>
            <p className="text-xs font-bold text-[#7ED321]">Nivel {nivel.nivel}</p>
            <p className="text-[10px] text-gray-500">{nivel.nome}</p>
          </div>
        </div>

        {emAndamento2 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Seu treinamento atual</h2>
              <Link href="/treinamentos" className="text-xs text-[#7ED321]">Ver todos</Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="flex">
                <div className="w-36 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                  <Play size={32} className="text-[#7ED321] opacity-80" />
                </div>
                <div className="p-4 flex-1">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">Curso em andamento</p>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{emAndamento2.treinamento?.titulo}</h3>
                  <p className="text-xs text-gray-500 mb-3">{emAndamento2.treinamento?.categoria}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                    <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${emAndamento2.percentual}%` }} />
                  </div>
                  <Link href="/treinamentos" className="inline-flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg">
                    <Play size={12} /> Continuar aula
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {(racs?.length ?? 0) > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" /> RACs pendentes
            </h2>
            <div className="space-y-2">
              {racs?.slice(0, 3).map(rac => (
                <div key={rac.id} className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-xs text-gray-900">{rac.titulo}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                    Prazo: {new Date(rac.prazo).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-3">
            <Star size={14} className="text-[#7ED321]" /> Seus pontos
          </div>
          <p className="text-3xl font-bold text-[#7ED321] text-center mb-1">{formatPontos(profile?.pontos ?? 0)}</p>
          <p className="text-[10px] text-gray-400 text-center">pontos acumulados</p>
          {nivel.proximo && (
            <div className="mt-3">
              <p className="text-[10px] text-gray-500 mb-1">Proximo nivel: {formatPontos(nivel.proximo)} pts</p>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${Math.min(100, ((profile?.pontos ?? 0) / nivel.proximo) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
            <span className="text-sm">✦</span> Assistente IA
          </div>
          <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">Pergunte sobre maquinas, processos ou procedimentos.</p>
          {['Qual tinta usar nesse material?', 'Por que minha impressao saiu com falha?', 'Como limpar o cabecote?'].map(q => (
            <Link key={q} href="/chat" className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 mb-1.5 text-[11px] text-gray-600 hover:border-[#7ED321] transition-colors">
              {q} <ArrowRight size={12} className="text-[#7ED321] flex-shrink-0" />
            </Link>
          ))}
          <Link href="/chat" className="mt-2 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-semibold py-2 rounded-lg hover:bg-gray-800">
            Abrir chat com IA
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-3">
            <Calendar size={14} className="text-[#7ED321]" /> Proximas atividades
          </div>
          {[
            { tipo: 'Aula', nome: 'Alinhamento de Mesa', sub: 'Impressora UV', quando: 'Hoje 14:00', cor: 'bg-green-50 text-green-700' },
            { tipo: 'Quiz', nome: 'Teste - Modulo 3', sub: 'Configuracao do arquivo', quando: 'Amanha', cor: 'bg-amber-50 text-amber-700' },
            { tipo: 'Pratica', nome: 'Impressao em acrilico', sub: 'Impressora UV', quando: '25/07', cor: 'bg-blue-50 text-blue-700' },
          ].map(item => (
            <div key={item.nome} className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
              <div className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${item.cor} self-start mt-0.5`}>{item.tipo}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{item.nome}</p>
                <p className="text-[10px] text-gray-500">{item.sub}</p>
              </div>
              <p className="text-[10px] text-gray-400 whitespace-nowrap">{item.quando}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
