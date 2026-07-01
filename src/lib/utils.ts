import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPontos(pontos: number) {
  return pontos.toLocaleString('pt-BR')
}

export function calcularNivel(pontos: number) {
  if (pontos >= 3000) return { nivel: 4, nome: 'Ouro', proximo: null, icone: '🥇' }
  if (pontos >= 1500) return { nivel: 3, nome: 'Prata', proximo: 3000, icone: '🥈' }
  if (pontos >= 500)  return { nivel: 2, nome: 'Bronze', proximo: 1500, icone: '🥉' }
  return { nivel: 1, nome: 'Iniciante', proximo: 500, icone: '🎯' }
}
