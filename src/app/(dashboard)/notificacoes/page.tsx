'use client'
import { useEffect, useState } from 'react'
import { Bell, BookOpen, Gift, Lightbulb, Settings2, CheckCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notificacao = {
  id: string
  tipo: 'treinamento_concluido' | 'bonificacao' | 'ideia' | 'sistema'
  titulo: string
  mensagem: string | null
  lida: boolean
  created_at: string
}

const tipoConfig = {
  treinamento_concluido: { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  bonificacao: { icon: Gift, color: 'text-[#7ED321]', bg: 'bg-green-50' },
  ideia: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  sistema: { icon: Settings2, color: 'text-gray-500', bg: 'bg-gray-100' },
}

function tempoRelativo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return `${d}d atrás`
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [marcandoTodas, setMarcandoTodas] = useState(false)

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/notificacoes')
    const data = await res.json()
    setNotificacoes(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function marcarLida(id: string) {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
    await fetch('/api/notificacoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  }

  async function marcarTodas() {
    setMarcandoTodas(true)
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    await fetch('/api/notificacoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
    setMarcandoTodas(false)
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <div className="max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-[#7ED321]" />
            Notificações
            {naoLidas > 0 && (
              <span className="bg-[#7ED321] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{naoLidas}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Acompanhe as atualizações da plataforma</p>
        </div>
        {naoLidas > 0 && (
          <button
            onClick={marcarTodas}
            disabled={marcandoTodas}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#7ED321] transition-colors disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={20} className="animate-spin mr-2" /> Carregando...
        </div>
      ) : notificacoes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Bell size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhuma notificação ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificacoes.map(n => {
            const cfg = tipoConfig[n.tipo] ?? tipoConfig.sistema
            const Icon = cfg.icon
            return (
              <div
                key={n.id}
                onClick={() => !n.lida && marcarLida(n.id)}
                className={cn(
                  'bg-white border rounded-xl p-4 flex items-start gap-3 transition-all',
                  n.lida
                    ? 'border-gray-100 opacity-60'
                    : 'border-gray-200 cursor-pointer hover:border-[#7ED321] hover:shadow-sm'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                  <Icon size={17} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', n.lida ? 'text-gray-500' : 'text-gray-900')}>{n.titulo}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{tempoRelativo(n.created_at)}</span>
                  </div>
                  {n.mensagem && <p className="text-xs text-gray-500 mt-0.5">{n.mensagem}</p>}
                </div>
                {!n.lida && <div className="w-2 h-2 rounded-full bg-[#7ED321] flex-shrink-0 mt-1.5" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
