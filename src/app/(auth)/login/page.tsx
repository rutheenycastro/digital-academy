'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Users, Monitor, Star } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetEnviado, setResetEnviado] = useState(false)

  async function handleEsqueceuSenha() {
    if (!email) { setErro('Digite seu e-mail antes de clicar em "Esqueceu a senha?".'); return }
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetEnviado(true)
    setErro('')
  }

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
      <div className="flex-1 bg-[#0d1117] p-10 flex flex-col relative overflow-hidden">
        {/* Glow verde no canto inferior esquerdo */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#7ED321] opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#7ED321] opacity-10 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-[#7ED321] flex items-center justify-center text-sm font-bold text-black">DA</div>
          <div>
            <div className="text-base font-bold text-white">digital <span className="text-[#7ED321]">training</span></div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Plataforma de treinamento</div>
          </div>
        </div>

        {/* Conteudo central */}
        <div className="my-auto z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Aqui, cada pessoa<br />
            <span className="text-[#7ED321]">desenvolve</span> o que nos<br />
            move todos os dias.
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">
            A Digital Training foi criada para voce aprender,<br />
            evoluir e fazer ainda mais pela nossa equipe,<br />
            nossos clientes e pelos resultados que construimos<br />
            juntos todos os dias.
          </p>

          {/* Cards de stats */}
          <div className="flex gap-3">
            {[
              { val: '120+', label: 'Cursos para sua evolucao', icon: Monitor },
              { val: '40+', label: 'Equipamentos e processos', icon: Star },
              { val: '100%', label: 'Conteudo pratico e atualizado', icon: Users },
            ].map(({ val, label, icon: Icon }) => (
              <div key={label} className="bg-[#161b22] border border-gray-800 rounded-xl px-4 py-3 flex-1">
                <Icon size={18} className="text-[#7ED321] mb-2" />
                <div className="text-xl font-bold text-[#7ED321]">{val}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="z-10">
          <p className="text-xs text-gray-600 mb-1">
            ♡ Aprender e o que nos torna melhores. <span className="text-[#7ED321]">Juntos, vamos mais longe.</span>
          </p>
          <p className="text-[10px] text-gray-700">
            © 2025 Digital Comunicacao Visual. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Lado direito — formulario */}
      <div className="w-[420px] bg-white p-10 flex flex-col justify-center">
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
              className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm text-gray-900 outline-none focus:border-[#7ED321] focus:ring-2 focus:ring-[#7ED321]/10 bg-gray-50"
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
                className="w-full h-11 border border-gray-200 rounded-xl px-3 pr-10 text-sm text-gray-900 outline-none focus:border-[#7ED321] focus:ring-2 focus:ring-[#7ED321]/10 bg-gray-50"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="text-right -mt-1">
            <button type="button" onClick={handleEsqueceuSenha} className="text-xs text-[#7ED321] hover:underline">Esqueceu a senha?</button>
          </div>

          {resetEnviado && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">Email de recuperacao enviado! Verifique sua caixa de entrada.</p>}
          {erro && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7ED321] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#6bbf1a] transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar na plataforma'}
          </button>
        </form>

        <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
          <p className="font-semibold text-gray-700 mb-2">Credenciais de demonstracao:</p>
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
