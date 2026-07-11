'use client'
import { Bell, MessageCircle, ChevronDown, Search, Settings } from 'lucide-react'
import Link from 'next/link'

interface TopbarProps {
  nome?: string
  funcao?: string
  role?: string
}

export function Topbar({ nome = 'Usuário', funcao = '', role }: TopbarProps) {
  const iniciais = nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const isAdmin = role === 'admin'

  return (
    <header className="h-13 bg-white border-b border-gray-200 flex items-center gap-3 px-5 flex-shrink-0">
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar treinamentos, máquinas, dúvidas..."
          className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-[#7ED321]"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link href="/notificacoes" className="relative w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#7ED321] transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7ED321]" />
        </Link>
        <Link href="/chat" className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#7ED321] transition-colors">
          <MessageCircle size={17} />
        </Link>
        {isAdmin && (
          <Link href="/configuracoes" className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#7ED321] transition-colors">
            <Settings size={17} />
          </Link>
        )}
        <Link href="/perfil" className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-[#7ED321] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-[#7ED321]">
            {iniciais}
          </div>
          <div className="text-xs">
            <div className="font-semibold text-gray-900">Olá, {nome.split(' ')[0]}!</div>
            {funcao && <div className="text-gray-500 text-[10px]">{funcao}</div>}
          </div>
          <ChevronDown size={13} className="text-gray-400" />
        </Link>
      </div>
    </header>
  )
}
