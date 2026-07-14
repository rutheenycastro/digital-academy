import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: treinamento } = await admin()
    .from('treinamentos')
    .select('*')
    .eq('id', id)
    .eq('ativo', true)
    .single()

  if (!treinamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: modulos } = await admin()
    .from('modulos_treinamento')
    .select('*, perguntas_avaliacao(*)')
    .eq('treinamento_id', id)
    .order('ordem')

  const { data: progresso } = await admin()
    .from('progresso_treinamentos')
    .select('*')
    .eq('treinamento_id', id)
    .eq('user_id', user.id)
    .single()

  const { data: progressoModulos } = await admin()
    .from('progresso_modulos')
    .select('*')
    .eq('treinamento_id', id)
    .eq('user_id', user.id)

  const progressoModulosMap = Object.fromEntries((progressoModulos ?? []).map(p => [p.modulo_id, p]))

  const modulosFormatados = (modulos ?? []).map(m => {
    const videos: { titulo: string; url: string }[] = Array.isArray(m.videos) && m.videos.length > 0
      ? m.videos
      : m.video_url ? [{ titulo: '', url: m.video_url }] : []

    return {
      id: m.id,
      titulo: m.titulo,
      videos,
      descricao: m.descricao ?? '',
      ordem: m.ordem,
      tem_avaliacao: m.tem_avaliacao,
      perguntas: (m.perguntas_avaliacao ?? []).map((p: { id: string; texto: string; opcoes: string[]; resposta_correta: number }) => ({
        id: p.id,
        texto: p.texto,
        opcoes: p.opcoes,
        resposta_correta: p.resposta_correta
      })),
      progresso: progressoModulosMap[m.id] ?? null
    }
  })

  return NextResponse.json({ treinamento, modulos: modulosFormatados, progresso: progresso ?? null })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { modulo_id, concluido, respostas } = await req.json()

  await admin().from('progresso_modulos').upsert({
    user_id: user.id,
    treinamento_id: id,
    modulo_id,
    concluido,
    respostas: respostas ?? null,
    concluido_em: concluido ? new Date().toISOString() : null
  }, { onConflict: 'user_id,modulo_id' })

  const { data: todosModulos } = await admin()
    .from('modulos_treinamento')
    .select('id')
    .eq('treinamento_id', id)

  const { data: modulosConcluidos } = await admin()
    .from('progresso_modulos')
    .select('id')
    .eq('treinamento_id', id)
    .eq('user_id', user.id)
    .eq('concluido', true)

  const total = todosModulos?.length ?? 0
  const concluidos = modulosConcluidos?.length ?? 0
  const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0
  const status = percentual === 100 ? 'concluido' : percentual > 0 ? 'em_andamento' : 'nao_iniciado'

  await admin().from('progresso_treinamentos').upsert({
    user_id: user.id,
    treinamento_id: id,
    percentual,
    status,
    concluido_em: status === 'concluido' ? new Date().toISOString() : null
  }, { onConflict: 'user_id,treinamento_id' })

  return NextResponse.json({ success: true, percentual, status })
}
