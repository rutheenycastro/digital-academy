import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await admin().from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await admin().from('profiles').select('*').order('nome')
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, password, nome, funcao, setor, role } = await req.json()

  const { data: authData, error: authError } = await admin().auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { nome }
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  await admin().from('profiles').insert({
    user_id: authData.user.id, nome, email, funcao, setor, role: role || 'colaborador', pontos: 0
  })

  return NextResponse.json({ success: true })
}

export async function PUT(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, nome, funcao, setor, role, email, password } = await req.json()

  await admin().from('profiles').update({ nome, funcao, setor, role, email }).eq('user_id', user_id)

  if (password) {
    const { data: authUsers } = await admin().auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === email)
    if (authUser) await admin().auth.admin.updateUserById(authUser.id, { password })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id } = await req.json()
  await admin().from('profiles').delete().eq('user_id', user_id)
  await admin().auth.admin.deleteUser(user_id)

  return NextResponse.json({ success: true })
}
