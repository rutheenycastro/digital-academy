import { createClient } from '@/lib/supabase/server'
import { calcularNivel, formatPontos } from '@/lib/utils'
import { ArrowRight, Play, Star, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: progressos }, { data: racs }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
    supabase.from('progresso_treinamentos').select('*, treinamento:treinamentos(titulo,categoria)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('racs').select('*').eq('user_id', user!.id).eq('status', 'aberta').order('prazo'),
  ])

  const nivel = calcularNivel(profile?.pontos ?? 0)
  const concluidos = progressos?.filter(p => p.status === 'concluido').length ?? 0
  const total = progressos?.length ?? 0
  const percentualGeral = total > 0 ? Math.round((concluidos / total) * 100) : 0
  const emAndamento = progressos?.find(p => p.status === 'em_andamento')

  return (
    <div className="grid grid-cols-[1fr_256px] gap-4">
      <div>
        {/* Hero progresso */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Seu progresso geral</p>
            <p className="text-4xl font-bold text-[#7ED321] leading-none">{percentualGeral}%</p>
            <p className="text-xs text-gray-500 mt-1">Você concluiu {concluidos} de {total} módulos</p>
            <div className="h-1.5 bg-gray-700 rounded-full mt-3 w-56">
              <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${percentualGeral}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-[#7ED321] flex items-center justify-center text-3xl mx-auto mb-1.5">{nivel.icone}</div>
            <p className="text-xs font-bold text-[#7ED321]">Nível {nivel.nivel}</p>
            <p className="text-[10px] text-gray-500">{nivel.nome}</p>
          </div>
        </div>

        {/* Treinamento atual */}
        {emAndamento && (
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
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{emAndamento.treinamento?.titulo}</h3>
                  <p className="text-xs text-gray-500 mb-3">{emAndamento.treinamento?.categoria}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                    <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${emAndamento.percentual}%` }} />
                  </div>
                  <Link href="/treinamentos" className="inline-flex items-center gap-1.5 bg-[#7ED321] text-black text-xs font-bold px-3 py-1.5 rounded-lg">
                    <Play size={12} /> Continuar aula
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pendências RAC */}
        {(racs?.length ?? 0) > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              RACs pendentes
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

        {/* Progresso dos módulos */}
        {(progressos?.length ?? 0) > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Progresso dos treinamentos</h2>
            <div className="space-y-3">
              {progressos?.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-40 truncate">{p.treinamento?.titulo}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${p.percentual}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-8 text-right">{p.percentual}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coluna direita */}
      <div className="space-y-3">
        {/* Pontos */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-3">
            <Star size={14} className="text-[#7ED321]" /> Seus pontos
          </div>
          <p className="text-3xl font-bold text-[#7ED321] text-center mb-1">{formatPontos(profile?.pontos ?? 0)}</p>
          <p className="text-[10px] text-gray-400 text-center">pontos acumulados</p>
          {nivel.proximo && (
            <div className="mt-3">
              <p className="text-[10px] text-gray-500 mb-1">Próximo nível: {formatPontos(nivel.proximo)} pts</p>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${Math.min(100, ((profile?.pontos ?? 0) / nivel.proximo) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Assistente IA */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
            <span className="text-sm">✦</span> Assistente IA
          </div>
          <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">Pergunte sobre máquinas, processos ou procedimentos.</p>
          {['Qual tinta usar nesse material?', 'Por que minha impressão saiu com falha?', 'Como limpar o cabeçote?'].map(q => (
            <Link key={q} href="/chat" className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 mb-1.5 text-[11px] text-gray-600 hover:border-[#7ED321] transition-colors">
              {q} <ArrowRight size={12} className="text-[#7ED321] flex-shrink-0" />
            </Link>
          ))}
          <Link href="/chat" className="mt-2 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-semibold py-2 rounded-lg hover:bg-gray-800">
            Abrir chat com IA
          </Link>
        </div>

        {/* Próximas atividades */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-3">
            <Calendar size={14} className="text-[#7ED321]" /> Próximas atividades
          </div>
          {[
            { tipo: 'Aula', nome: 'Alinhamento de Mesa', sub: 'Impressora UV', quando: 'Hoje 14:00', cor: 'bg-green-50 text-green-700' },
            { tipo: 'Quiz', nome: 'Teste — Módulo 3', sub: 'Configuração do arquivo', quando: 'Amanhã', cor: 'bg-amber-50 text-amber-700' },
            { tipo: 'Prática', nome: 'Impressão em acrílico', sub: 'Impressora UV', quando: '25/07', cor: 'bg-blue-50 text-blue-700' },
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
