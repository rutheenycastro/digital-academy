import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, secret } = await req.json()
  if (secret !== 'digital-setup-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: user } = await supabase.from('auth.users').select('id').eq('email', email).single()

  const { data, error } = await supabase.auth.admin.listUsers()
  const found = data?.users?.find(u => u.email === email)
  if (!found) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error: updateError } = await supabase.auth.admin.updateUserById(found.id, { password })
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
