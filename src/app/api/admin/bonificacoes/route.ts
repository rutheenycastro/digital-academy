import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { notificar, notificarRoles } from '@/lib/notificacoes'

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
  if (!['admin', 'gestor'].includes(profile?.role)) return null
  return user
}

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id, pontos, operacao } = await req.json()

  const { data: profile } = await admin().from('profiles').select('pontos, nome').eq('user_id', user_id).single()
  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const novosPontos = operacao === 'remover'
    ? Math.max(0, (profile.pontos ?? 0) - pontos)
    : (profile.pontos ?? 0) + pontos

  const { error } = await admin().from('profiles').update({ pontos: novosPontos }).eq('user_id', user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notifica o colaborador
  if (operacao === 'remover') {
    await notificar(user_id, 'bonificacao', `${pontos} pontos removidos`, `Seu saldo agora é ${novosPontos} pontos.`)
  } else {
    await notificar(user_id, 'bonificacao', `Você recebeu ${pontos} pontos! 🎉`, `Seu saldo agora é ${novosPontos} pontos.`)
  }

  // Notifica gestores/rh/admin sobre a movimentação
  await notificarRoles(
    ['gestor', 'rh', 'admin'],
    'bonificacao',
    `Bonificação: ${profile.nome}`,
    `${operacao === 'remover' ? 'Removido' : 'Adicionado'} ${pontos} pontos. Saldo atual: ${novosPontos}.`
  )

  return NextResponse.json({ success: true, pontos: novosPontos })
}
