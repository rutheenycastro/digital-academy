'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Lock, CheckCircle, AlertCircle, Clock, BookOpen } from 'lucide-react'

export default function PerfilPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [setor, setSetor] = useState('')

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [mensagemSenha, setMensagemSenha] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  const [historico, setHistorico] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      const { data: hist } = await supabase
        .from('progresso_treinamentos')
        .select('*, treinamento:treinamentos(titulo, categoria)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10)

      setProfile({ ...prof, email: user.email })
      setNome(prof?.nome ?? '')
      setFuncao(prof?.funcao ?? '')
      setSetor(prof?.setor ?? '')
      setHistorico(hist ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setMensagem(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ nome, funcao, setor }).eq('user_id', user!.id)
    if (error) setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    else setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' })
    setSalvando(false)
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmarSenha) { setMensagemSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' }); return }
    if (novaSenha.length < 6) { setMensagemSenha({ tipo: 'erro', texto: 'A senha deve ter pelo menos 6 caracteres.' }); return }
    setSalvandoSenha(true)
    setMensagemSenha(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) setMensagemSenha({ tipo: 'erro', texto: 'Erro ao trocar senha. Tente novamente.' })
    else {
      setMensagemSenha({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' })
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('')
    }
    setSalvandoSenha(false)
  }

  const iniciais = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#7ED321] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header do perfil */}
      <div className="bg-gray-900 rounded-2xl p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gray-700 border-2 border-[#7ED321] flex items-center justify-center text-2xl font-bold text-[#7ED321]">
            {iniciais}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#7ED321] rounded-lg flex items-center justify-center hover:bg-[#6bbf1a] transition-colors">
            <Camera size={13} className="text-black" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{nome || 'Usuário'}</h1>
          <p className="text-sm text-gray-400">{funcao || 'Sem cargo definido'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
        </div>
        <div className="ml-auto flex gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#7ED321]">{profile?.pontos ?? 0}</p>
            <p className="text-[10px] text-gray-500">pontos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{historico.filter(h => h.status === 'concluido').length}</p>
            <p className="text-[10px] text-gray-500">concluídos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Informações pessoais */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Informações pessoais</h2>
          <form onSubmit={salvarPerfil} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input value={profile?.email} disabled
                className="w-full h-9 border border-gray-100 rounded-lg px-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cargo / Função</label>
              <input value={funcao} onChange={e => setFuncao(e.target.value)}
                className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Setor</label>
              <input value={setor} onChange={e => setSetor(e.target.value)}
                className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            {mensagem && (
              <div className={`flex items-center gap-2 text-xs p-2.5 rounded-lg ${mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {mensagem.tipo === 'sucesso' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {mensagem.texto}
              </div>
            )}
            <button type="submit" disabled={salvando}
              className="w-full bg-[#7ED321] text-black text-xs font-bold py-2 rounded-lg hover:bg-[#6bbf1a] disabled:opacity-60 transition-colors">
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </div>

        {/* Trocar senha */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock size={14} className="text-[#7ED321]" /> Trocar senha</h2>
          <form onSubmit={trocarSenha} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nova senha</label>
              <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="••••••••"
                className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nova senha</label>
              <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="••••••••"
                className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#7ED321]" />
            </div>
            {mensagemSenha && (
              <div className={`flex items-center gap-2 text-xs p-2.5 rounded-lg ${mensagemSenha.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {mensagemSenha.tipo === 'sucesso' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {mensagemSenha.texto}
              </div>
            )}
            <button type="submit" disabled={salvandoSenha}
              className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors">
              {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>

          {/* Role */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-2">Nível de acesso</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
              profile?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              profile?.role === 'gestor' ? 'bg-blue-100 text-blue-700' :
              profile?.role === 'rh' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {profile?.role === 'admin' ? '★ Administrador' :
               profile?.role === 'gestor' ? '◆ Gestor' :
               profile?.role === 'rh' ? '● RH' : '● Colaborador'}
            </span>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen size={14} className="text-[#7ED321]" /> Histórico de treinamentos</h2>
        {historico.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">Nenhum treinamento iniciado ainda.</p>
        ) : (
          <div className="space-y-2">
            {historico.map(h => (
              <div key={h.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.status === 'concluido' ? 'bg-[#7ED321]' : h.status === 'em_andamento' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{h.treinamento?.titulo}</p>
                  <p className="text-[10px] text-gray-500">{h.treinamento?.categoria}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full rounded-full bg-[#7ED321]" style={{ width: `${h.percentual}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-8 text-right">{h.percentual}%</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    h.status === 'concluido' ? 'bg-green-100 text-green-700' :
                    h.status === 'em_andamento' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {h.status === 'concluido' ? 'Concluído' : h.status === 'em_andamento' ? 'Em andamento' : 'Não iniciado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
