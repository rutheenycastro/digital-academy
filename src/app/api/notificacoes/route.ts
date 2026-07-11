import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await adminClient().from('profiles').select('role').eq('user_id', user.id).single()
  return { user, role: profile?.role ?? 'colaborador' }
}

// GET: lista notificações do usuário logado
export async function GET() {
  const auth = await getUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await adminClient()
    .from('notificacoes')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data ?? [])
}

// PUT: marca notificação como lida (ou todas)
export async function PUT(req: Request) {
  const auth = await getUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, all } = await req.json()

  if (all) {
    await adminClient()
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', auth.user.id)
  } else if (id) {
    await adminClient()
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
      .eq('user_id', auth.user.id)
  }

  return NextResponse.json({ success: true })
}
