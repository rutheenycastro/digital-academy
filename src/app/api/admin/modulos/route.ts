import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAccess() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await admin().from('profiles').select('role').eq('user_id', user.id).single()
  if (!['admin', 'gestor'].includes(profile?.role)) return null
  return user
}

export async function GET(req: Request) {
  const user = await checkAccess()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const treinamento_id = searchParams.get('treinamento_id')
  if (!treinamento_id) return NextResponse.json({ error: 'treinamento_id required' }, { status: 400 })

  const { data: modulos } = await admin()
    .from('modulos_treinamento')
    .select('*, perguntas_avaliacao(*)')
    .eq('treinamento_id', treinamento_id)
    .order('ordem')

  const result = (modulos ?? []).map(m => {
    // Compatibilidade: se ainda tem video_url mas não tem videos[], migra
    let videos: { titulo: string; url: string }[] = Array.isArray(m.videos) && m.videos.length > 0
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
      }))
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const user = await checkAccess()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { treinamento_id, modulos } = await req.json()
  if (!treinamento_id) return NextResponse.json({ error: 'treinamento_id required' }, { status: 400 })

  const { data: existentes } = await admin()
    .from('modulos_treinamento')
    .select('id')
    .eq('treinamento_id', treinamento_id)

  if (existentes?.length) {
    const ids = existentes.map(m => m.id)
    await admin().from('perguntas_avaliacao').delete().in('modulo_id', ids)
  }

  await admin().from('modulos_treinamento').delete().eq('treinamento_id', treinamento_id)

  if (!modulos?.length) return NextResponse.json({ success: true })

  for (const mod of modulos) {
    const { data: novoMod, error: modError } = await admin()
      .from('modulos_treinamento')
      .insert({
        treinamento_id,
        titulo: mod.titulo,
        video_url: mod.videos?.[0]?.url ?? '',
        videos: mod.videos ?? [],
        descricao: mod.descricao,
        ordem: mod.ordem,
        tem_avaliacao: mod.tem_avaliacao ?? false
      })
      .select()
      .single()

    if (modError || !novoMod) continue

    if (mod.tem_avaliacao && mod.perguntas?.length) {
      await admin().from('perguntas_avaliacao').insert(
        mod.perguntas.map((p: { texto: string; opcoes: string[]; resposta_correta: number }) => ({
          modulo_id: novoMod.id,
          texto: p.texto,
          opcoes: p.opcoes,
          resposta_correta: p.resposta_correta
        }))
      )
    }
  }

  await admin()
    .from('treinamentos')
    .update({ carga_horaria: modulos.length })
    .eq('id', treinamento_id)

  return NextResponse.json({ success: true })
}
