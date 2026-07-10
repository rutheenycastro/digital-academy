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
  if (!['admin', 'gestor', 'rh'].includes(profile?.role)) return null
  return user
}

// GET: lista treinamentos atribuídos a um usuário
export async function GET(req: Request) {
  const user = await checkAccess()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const { data } = await admin()
    .from('progresso_treinamentos')
    .select('treinamento_id')
    .eq('user_id', user_id)

  return NextResponse.json(data ?? [])
}

// POST: define quais treinamentos estão atribuídos ao usuário
export async function POST(req: Request) {
  const user = await checkAccess()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, treinamento_ids } = await req.json()
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  // Remove todos os existentes
  await admin().from('progresso_treinamentos').delete().eq('user_id', user_id)

  // Insere os novos
  if (treinamento_ids?.length > 0) {
    const inserts = treinamento_ids.map((tid: string) => ({
      user_id,
      treinamento_id: tid,
      status: 'nao_iniciado',
      percentual: 0
    }))
    const { error } = await admin().from('progresso_treinamentos').insert(inserts)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
