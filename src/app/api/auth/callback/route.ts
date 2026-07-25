import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (tokenHash && type === 'recovery') {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      'https://hipuneooqzrpwbcyfzkp.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTkzODcsImV4cCI6MjA5NzM5NTM4N30.IMEpYs56WOJ-2GH_OcHOEfV5M7qWG44_M_hA7hsLpPs',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`)
    }
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      'https://hipuneooqzrpwbcyfzkp.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTkzODcsImV4cCI6MjA5NzM5NTM4N30.IMEpYs56WOJ-2GH_OcHOEfV5M7qWG44_M_hA7hsLpPs',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/inicio`)
}
