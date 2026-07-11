import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

type Tipo = 'treinamento_concluido' | 'bonificacao' | 'ideia' | 'sistema'

// Envia notificação para um usuário específico
export async function notificar(user_id: string, tipo: Tipo, titulo: string, mensagem?: string) {
  await admin().from('notificacoes').insert({ user_id, tipo, titulo, mensagem })
}

// Envia para todos os usuários com determinados roles
export async function notificarRoles(roles: string[], tipo: Tipo, titulo: string, mensagem?: string) {
  const { data: profiles } = await admin()
    .from('profiles')
    .select('user_id')
    .in('role', roles)

  if (!profiles?.length) return

  await admin().from('notificacoes').insert(
    profiles.map(p => ({ user_id: p.user_id, tipo, titulo, mensagem }))
  )
}
