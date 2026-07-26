'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    async function verificarToken() {
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const supabase = createClient()

      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        if (error) {
          setErro('Link expirado ou inválido. Solicite um novo e-mail de redefinição.')
        } else {
          setPronto(true)
        }
        return
      }

      // Fallback: verificar se já tem sessão ativa (hash no URL)
      const hash = window.location.hash
      if (hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          setPronto(true)
          return
        }
      }

      setErro('Link inválido. Solicite um novo e-mail de redefinição.')
    }
    verificarToken()
  }, [searchParams])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setErro('')
    const { error } = await createClient().auth.updateUser({ password: senha })
    if (error) { setErro('Erro ao redefinir senha. Tente novamente.'); setLoading(false) }
    else { setSucesso(true); setTimeout(() => router.push('/login'), 2000) }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="bg-white rounded-2xl p-8 w-96 shadow-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#7ED321] flex items-center justify-center text-sm font-bold text-black">DA</div>
          <div>
            <div className="text-sm font-bold text-gray-900">digital <span className="text-[#7ED321]">training</span></div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Plataforma de treinamento</div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Redefinir senha</h2>
        <p className="text-sm text-gray-500 mb-6">Digite sua nova senha abaixo.</p>

        {sucesso ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 text-center">
            Senha redefinida com sucesso! Redirecionando...
          </div>
        ) : erro && !pronto ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 text-center">
            {erro}
            <div className="mt-3">
              <button onClick={() => router.push('/login')} className="text-[#7ED321] font-medium underline text-xs">
                Voltar ao login
              </button>
            </div>
          </div>
        ) : pronto ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nova senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirmar senha</label>
              <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            {erro && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#7ED321] text-black font-bold py-2.5 rounded-lg text-sm disabled:opacity-60">
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">Verificando link...</div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-900 text-white">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
