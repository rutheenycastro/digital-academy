'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Laptop, Factory, Route, Award, ClipboardCheck,
  Users,
  BarChart3, Gift, AlertTriangle, Trophy, LogOut,
  Lightbulb, Wrench, CalendarDays, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/inicio', icon: Home, label: 'Início', hideForRoles: [] },
  { href: '/treinamentos', icon: Laptop, label: 'Meus Treinamentos', hideForRoles: ['admin', 'gestor', 'rh'] },
  { href: '/biblioteca', icon: Factory, label: 'Biblioteca de Máquinas', hideForRoles: ['admin', 'gestor', 'rh'] },
  { href: '/trilhas', icon: Route, label: 'Trilhas por Função', hideForRoles: [] },
  { href: '/certificados', icon: Award, label: 'Certificados', hideForRoles: [] },
  { href: '/avaliacoes', icon: ClipboardCheck, label: 'Avaliações', hideForRoles: [] },
  { href: '/racs', icon: AlertTriangle, label: 'RACs', hideForRoles: [] },
  { href: '/conquistas', icon: Trophy, label: 'Conquistas', hideForRoles: [] },
]

const gestorItems = [
  { href: '/colaboradores', icon: Users, label: 'Colaboradores', roles: ['gestor', 'rh', 'admin'] },
  { href: '/ideias-pendentes', icon: Lightbulb, label: 'Ideias Pendentes', roles: ['gestor', 'rh', 'admin'] },
  { href: '/pontuacao', icon: Star, label: 'Pontuação', roles: ['gestor', 'rh', 'admin'] },
  { href: '/ponto-rh', icon: CalendarDays, label: 'Ponto & RH', roles: ['rh', 'admin', 'gestor'] },
  { href: '/equipamentos-acesso', icon: Wrench, label: 'Acesso Equipamentos', roles: ['rh', 'admin', 'gestor'] },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios', roles: ['gestor', 'rh', 'admin'] },
  { href: '/admin-usuarios', icon: Users, label: 'Gestão de Usuários', roles: ['admin', 'gestor', 'rh'] },
  { href: '/admin-treinamentos', icon: Laptop, label: 'Gestão Treinamentos', roles: ['admin', 'gestor'] },
  { href: '/admin-bonificacoes', icon: Gift, label: 'Bonificações', roles: ['admin', 'gestor', 'rh'] },
]

export function Sidebar({ role: roleProp }: { role?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string>(roleProp ?? 'colaborador')

  useEffect(() => {
    if (roleProp) { setRole(roleProp); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('user_id', user.id).single()
          .then(({ data }) => { if (data) setRole(data.role) })
      }
    })
  }, [roleProp])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const visibleGestorItems = gestorItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-48 bg-gray-900 flex flex-col h-screen flex-shrink-0">
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7ED321] flex items-center justify-center text-xs font-bold text-black flex-shrink-0">DA</div>
          <div>
            <div className="text-sm font-bold text-white leading-none">digital</div>
            <div className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Plataforma de treinamento</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.filter(item => !item.hideForRoles.includes(role)).map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
              pathname === href ? 'bg-[#7ED321] text-black font-semibold' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            )}>
            <Icon size={15} className="flex-shrink-0" />{label}
          </Link>
        ))}

        {visibleGestorItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
              pathname === href ? 'bg-[#7ED321] text-black font-semibold' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            )}>
            <Icon size={15} className="flex-shrink-0" />{label}
          </Link>
        ))}
      </nav>

      <div className="p-2">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all">
          <LogOut size={14} /> Sair
        </button>
      </div>
    </aside>
  )
}
