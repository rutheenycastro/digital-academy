export type UserRole = 'colaborador' | 'gestor' | 'rh' | 'admin'

export type TrainingStatus = 'nao_iniciado' | 'em_andamento' | 'concluido'

export type RacStatus = 'aberta' | 'em_analise' | 'concluida'

export type AtividadeTipo = '5s' | 'melhoria' | 'seguranca' | 'producao'

export interface Profile {
  id: string
  user_id: string
  nome: string
  email: string
  funcao: string
  setor: string
  role: UserRole
  avatar_url: string | null
  pontos: number
  nivel: number
  created_at: string
}

export interface Treinamento {
  id: string
  titulo: string
  descricao: string
  categoria: string
  equipamento_id: string | null
  carga_horaria: number
  pontos_conclusao: number
  obrigatorio: boolean
  requerido_vale: boolean
  thumbnail_url: string | null
  created_at: string
  modulos?: Modulo[]
}

export interface Modulo {
  id: string
  treinamento_id: string
  titulo: string
  descricao: string | null
  tipo: 'video' | 'texto' | 'quiz' | 'pratico'
  video_url: string | null
  conteudo: string | null
  ordem: number
  duracao_minutos: number
}

export interface ProgressoTreinamento {
  id: string
  user_id: string
  treinamento_id: string
  status: TrainingStatus
  percentual: number
  pontos_ganhos: number
  nota_final: number | null
  concluido_em: string | null
  created_at: string
  treinamento?: Treinamento
}

export interface Avaliacao {
  id: string
  treinamento_id: string
  user_id: string
  nota: number
  pontos: number
  respostas: Record<string, string>
  created_at: string
}

export interface Certificado {
  id: string
  user_id: string
  treinamento_id: string
  numero: string
  emitido_em: string
  valido_ate: string | null
  url_pdf: string | null
  treinamento?: Treinamento
}

export interface Equipamento {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  imagem_url: string | null
  manual_url: string | null
  created_at: string
}

export interface RAC {
  id: string
  numero: string
  titulo: string
  descricao: string
  user_id: string
  responsavel_id: string | null
  status: RacStatus
  prazo: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  requerido_vale: boolean
  created_at: string
  profile?: Profile
}

export interface Atividade {
  id: string
  user_id: string
  tipo: AtividadeTipo
  titulo: string
  descricao: string
  imagem_url: string | null
  pontos: number
  curtidas: number
  aprovado: boolean
  created_at: string
  profile?: Profile
}

export interface Conquista {
  id: string
  nome: string
  descricao: string
  icone: string
  pontos_necessarios: number | null
  criterio: Record<string, unknown>
}

export interface ConquistaUsuario {
  id: string
  user_id: string
  conquista_id: string
  conquistado_em: string
  conquista?: Conquista
}
