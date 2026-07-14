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

// GET: lista colaboradores + seus acessos
export async function GET() {
  const user = await checkAccess()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: colaboradores } = await admin()
    .from('profiles')
    .select('user_id, nome, funcao, setor')
    .in('role', ['colaborador', 'rh'])
    .order('nome')

  const { data: acessos } = await admin()
    .from('acesso_equipamentos')
    .select('user_id, equipamento_id, liberado')

  return NextResponse.json({ colaboradores: colaboradores ?? [], acessos: acessos ?? [] })
}

// POST: salva/atualiza acesso de um colaborador a um equipamento
export async function POST(req: Request) {
  const user = await checkAccess()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, equipamento_id, liberado } = await req.json()

  await admin().from('acesso_equipamentos').upsert(
    { user_id, equipamento_id, liberado },
    { onConflict: 'user_id,equipamento_id' }
  )

  return NextResponse.json({ success: true })
}
