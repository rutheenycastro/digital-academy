import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, secret } = await req.json()
  if (secret !== 'digital-setup-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', url: !!url, key: !!key }, { status: 500 })
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message, step: 'listUsers' }, { status: 500 })

  const user = data.users.find(u => u.email === email)
  if (!user) return NextResponse.json({ error: 'User not found', emails: data.users.map(u => u.email) }, { status: 404 })

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
  if (error) return NextResponse.json({ error: error.message, step: 'updateUser' }, { status: 500 })

  return NextResponse.json({ success: true, userId: user.id })
}
