import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAccess() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await adminClient().from('profiles').select('role').eq('user_id', user.id).single()
  if (!profile || !['admin', 'gestor', 'rh'].includes(profile.role)) return null
  return { user, role: profile.role as string }
}

function isGestor(role: string) { return ['admin', 'gestor'].includes(role) }

export async function GET() {
  const access = await checkAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await adminClient().from('profiles').select('*').order('nome')
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const access = await checkAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, password, nome, funcao, setor, role } = await req.json()

  // RH só pode criar colaboradores
  const targetRole = isGestor(access.role) ? (role || 'colaborador') : 'colaborador'

  const { data: authData, error: authError } = await adminClient().auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { nome }
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  await adminClient().from('profiles').insert({
    user_id: authData.user.id, nome, email, funcao, setor, role: targetRole, pontos: 0
  })

  return NextResponse.json({ success: true })
}

export async function PUT(req: Request) {
  const access = await checkAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, nome, funcao, setor, role, email, password } = await req.json()

  // Verifica se RH está tentando editar um não-colaborador
  if (!isGestor(access.role)) {
    const { data: target } = await adminClient().from('profiles').select('role').eq('user_id', user_id).single()
    if (target?.role !== 'colaborador') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const updateData: Record<string, string> = { nome, funcao, setor, email }
  if (isGestor(access.role) && role) updateData.role = role

  await adminClient().from('profiles').update(updateData).eq('user_id', user_id)

  if (password && isGestor(access.role)) {
    await adminClient().auth.admin.updateUserById(user_id, { password })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const access = await checkAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id } = await req.json()

  // Verifica se RH está tentando excluir um não-colaborador
  if (!isGestor(access.role)) {
    const { data: target } = await adminClient().from('profiles').select('role').eq('user_id', user_id).single()
    if (target?.role !== 'colaborador') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  await adminClient().from('profiles').delete().eq('user_id', user_id)
  await adminClient().auth.admin.deleteUser(user_id)

  return NextResponse.json({ success: true })
}
