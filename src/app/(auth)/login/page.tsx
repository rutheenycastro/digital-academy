'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.')
      setLoading(false)
    } else {
      router.push('/inicio')
      router.refresh()
    }
  }

  return (
    <div className="flex h-screen">
      {/* Lado esquerdo — dark */}
      <div className="flex-1 bg-gray-900 p-8 flex flex-col">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="w-10 h-10 rounded-xl bg-[#7ED321] flex items-center justify-center text-sm font-bold text-black">DA</div>
          <div>
            <div className="text-base font-bold text-white">digital <span className="text-[#7ED321]">academy</span></div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Plataforma de treinamento</div>
          </div>
        </div>

        <div className="my-auto">
          <h1 className="text-3xl font-bold text-white leading-tight mb-3">
            Treine sua equipe.<br />
            <span className="text-[#7ED321]">Potencialize</span> resultados.
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
            A universidade corporativa para empresas de comunicação visual e indústria gráfica. Capacite colaboradores com inteligência.
          </p>
          <div className="flex gap-3">
            {[['500+', 'Colaboradores'], ['120+', 'Treinamentos'], ['98%', 'Satisfação']].map(([val, label]) => (
              <div key={label} className="bg-gray-800 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-[#7ED321]">{val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-600 mt-6">
          © 2025 Digital Comunicação Visual. Todos os direitos reservados.
        </p>
      </div>

      {/* Lado direito — formulário */}
      <div className="w-96 bg-white p-8 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h2>
        <p className="text-sm text-gray-500 mb-7">Entre com suas credenciais para continuar.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 outline-none focus:border-[#7ED321] focus:ring-2 focus:ring-[#7ED321]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 border border-gray-300 rounded-lg px-3 pr-10 text-sm text-gray-900 outline-none focus:border-[#7ED321] focus:ring-2 focus:ring-[#7ED321]/10"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-xs text-[#7ED321] hover:underline">Esqueceu a senha?</a>
          </div>

          {erro && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7ED321] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#6bbf1a] transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar na plataforma'}
          </button>
        </form>

        <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
          <p className="font-semibold text-gray-700 mb-2">Credenciais de demonstração:</p>
          <div className="flex justify-between text-gray-500 mb-1">
            <span>Colaborador:</span><span className="text-gray-700 font-medium">colaborador@digital.com / 123456</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Gestor:</span><span className="text-gray-700 font-medium">gestor@digital.com / 123456</span>
          </div>
        </div>
      </div>
    </div>
  )
}
