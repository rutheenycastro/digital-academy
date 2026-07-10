import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export const dynamic = 'force-dynamic'

export default async function GestorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin(
    'https://hipuneooqzrpwbcyfzkp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await admin.from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile || !['gestor', 'rh', 'admin'].includes(profile.role)) redirect('/inicio')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar nome={profile.nome} funcao={profile.funcao} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-5">{children}</main>
      </div>
    </div>
  )
}
