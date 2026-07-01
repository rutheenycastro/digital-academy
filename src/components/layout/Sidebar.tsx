'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Laptop, Factory, Route, Award, ClipboardCheck,
  Activity, MessageCircle, LayoutDashboard, Users,
  BarChart3, Settings, Gift, AlertTriangle, Trophy, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/inicio', icon: Home, label: 'Início' },
  { href: '/treinamentos', icon: Laptop, label: 'Meus Treinamentos' },
  { href: '/biblioteca', icon: Factory, label: 'Biblioteca de Máquinas' },
  { href: '/trilhas', icon: Route, label: 'Trilhas por Função' },
  { href: '/certificados', icon: Award, label: 'Certificados' },
  { href: '/avaliacoes', icon: ClipboardCheck, label: 'Avaliações' },
  { href: '/atividades', icon: Activity, label: 'Minhas Atividades' },
  { href: '/racs', icon: AlertTriangle, label: 'RACs' },
  { href: '/conquistas', icon: Trophy, label: 'Conquistas' },
  { href: '/chat', icon: MessageCircle, label: 'Chat com IA' },
]

const gestorItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/colaboradores', icon: Users, label: 'Colaboradores' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-48 bg-gray-900 flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7ED321] flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
            DA
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none">digital</div>
            <div className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Plataforma de treinamento</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
              pathname === href
                ? 'bg-[#7ED321] text-black font-semibold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            )}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-3 pb-1">
          <p className="px-2.5 text-[9px] text-gray-500 uppercase tracking-wider font-medium">Para gestores</p>
        </div>

        {gestorItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
              pathname === href
                ? 'bg-[#7ED321] text-black font-semibold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            )}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Promo + Logout */}
      <div className="p-2 space-y-2">
        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
          <Gift size={16} className="text-[#7ED321] mb-1.5" />
          <p className="text-xs font-semibold text-white">Indique e ganhe</p>
          <p className="text-[10px] text-gray-400 mt-0.5 mb-2 leading-tight">Convide sua equipe e ganhe benefícios!</p>
          <button className="w-full bg-[#7ED321] text-black text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-between px-2">
            Saiba mais <span>→</span>
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </aside>
  )
}
