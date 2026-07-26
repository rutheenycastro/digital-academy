import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

  if (tokenHash && type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password?token_hash=${tokenHash}&type=recovery`)
  }

  if (code) {
    return NextResponse.redirect(`${origin}/reset-password?code=${code}`)
  }

  return NextResponse.redirect(`${origin}/inicio`)
}
