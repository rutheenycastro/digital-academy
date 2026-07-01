# Digital Academy — Plataforma de Treinamento

Plataforma corporativa de treinamento para a Digital Comunicação Visual (gráfica, malharia, fábrica de tendas e brindes).

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend / DB**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel

## Funcionalidades

- Login com controle de acesso por perfil (colaborador / gestor / RH / admin)
- Trilhas de treinamento por função com módulos de vídeo, texto, quiz e prática
- Biblioteca de máquinas com manuais e vídeos por equipamento
- Sistema de pontos, níveis e conquistas (gamificação)
- Avaliações e quizzes com pontuação automática
- Certificados (NR-12, Vale e internos)
- RACs com prazos e status de acompanhamento
- Feed de melhorias 5S com curtidas e pontuação
- Chat com assistente IA
- Painel do gestor: dashboard, colaboradores e relatórios

## Setup local

```bash
# 1. Instale as dependências
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas credenciais Supabase

# 3. Execute o schema no SQL Editor do Supabase
# Cole o conteúdo de supabase/migrations/001_schema.sql

# 4. Rode o projeto
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie **URL** e **anon key** em Settings > API
3. Cole no `.env.local`
4. Execute `supabase/migrations/001_schema.sql` no SQL Editor

## Deploy (Vercel)

1. Push para o GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente no painel Vercel
4. Deploy automático a cada push em `main`

## Estrutura

```
src/
  app/
    (auth)/login/       — Tela de login
    (dashboard)/        — Área do colaborador
      inicio/           — Dashboard pessoal
      treinamentos/     — Lista de treinamentos
      biblioteca/       — Biblioteca de máquinas
      certificados/     — Certificados emitidos
      avaliacoes/       — Quizzes e avaliações
      atividades/       — Feed de melhorias 5S
      racs/             — RACs
      conquistas/       — Gamificação e ranking
      chat/             — Assistente IA
    (gestor)/           — Área restrita gestores/RH
      dashboard/        — Painel executivo
      colaboradores/    — Gestão da equipe
      relatorios/       — Relatórios e gráficos
    api/                — API Routes Next.js
  components/layout/    — Sidebar e Topbar
  lib/supabase/         — Clientes browser + server
  types/                — TypeScript types
supabase/migrations/    — Schema SQL do banco
```
