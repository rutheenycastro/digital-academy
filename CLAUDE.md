# Digital Academy — Plataforma de Treinamento

## Visão Geral
Plataforma corporativa de treinamento para a Digital Comunicação Visual.
Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase, Vercel (Hobby).

**IMPORTANTE:** Este projeto é completamente separado do projeto Rouads. Nunca misturar código ou configurações entre eles.

## URLs
- **Produção:** digitaltraining.com.br (Vercel)
- **Supabase:** https://hipuneooqzrpwbcyfzkp.supabase.co
- **GitHub:** https://github.com/rutheenycastro/digital-academy

## Credenciais Supabase (hardcoded — não usar variáveis de ambiente)
- URL: `https://hipuneooqzrpwbcyfzkp.supabase.co`
- ANON KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTkzODcsImV4cCI6MjA5NzM5NTM4N30.IMEpYs56WOJ-2GH_OcHOEfV5M7qWG44_M_hA7hsLpPs`
- SERVICE ROLE KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA`

## Roles e Permissões
- **admin**: acesso total + ícone de engrenagem (configurações) no topbar
- **gestor**: dashboard com visão da equipe, todos os itens do sidebar exceto configurações
- **rh**: dashboard focado em pessoas, sem acesso a criar/editar treinamentos
- **colaborador**: visão pessoal — seus treinamentos, pontos, conquistas

## Estrutura de Rotas
- `src/app/(auth)/login` — página de login pública
- `src/app/(dashboard)/` — rotas para todos os usuários logados (inicio, perfil, notificacoes, ponto-rh, etc.)
- `src/app/(gestor)/` — rotas exclusivas para gestor/rh/admin (admin-usuarios, admin-treinamentos, colaboradores, etc.)

## Padrão de Admin Client (SEMPRE usar para operações privilegiadas)
```typescript
import { createClient } from '@supabase/supabase-js'
const adminClient = () => createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})
```

## Sidebar
- `src/components/layout/Sidebar.tsx` — role recebido como prop do server layout
- `navItems`: itens para todos (com hideForRoles para gestor/rh/admin)
- `gestorItems`: itens só para gestor/rh/admin (filtrados por roles[])
- Sem divisória "PARA GESTORES" — lista única
- Chat com IA e Configurações ficam no Topbar (não no sidebar)

## Topbar
- `src/components/layout/Topbar.tsx`
- Ícone de sino → /notificacoes
- Ícone de chat → /chat
- Ícone de engrenagem → /configuracoes (visível só para admin)
- Nome do usuário → /perfil

## Layouts
- `src/app/(dashboard)/layout.tsx` — usa adminClient, passa role+nome+funcao para Sidebar e Topbar
- `src/app/(gestor)/layout.tsx` — redireciona para /inicio se não for gestor/rh/admin
- Ambos têm `export const dynamic = 'force-dynamic'`

## Dashboard por Role (src/app/(dashboard)/inicio/page.tsx)
- **gestor/admin**: 4 cards, progresso por colaborador, treinamentos ativos, top colaboradores, atalhos
- **rh**: 4 cards (com/sem treinamento), alerta de pendentes, progresso, treinamentos ativos, atalhos RH
- **colaborador**: progresso pessoal, treinamento em andamento, RACs pendentes, pontos, chat IA

## Notificações
- Tabela `notificacoes` no Supabase (rodar supabase-notificacoes.sql se não existir)
- API: `src/app/api/notificacoes/route.ts` (GET lista, PUT marca lida)
- Helper: `src/lib/notificacoes.ts` → `notificar(user_id, tipo, titulo, mensagem)` e `notificarRoles(roles[], ...)`
- Bonificação já dispara notificação automática para o colaborador e gestores

## Tabelas Supabase Criadas Manualmente (SQLs na raiz do projeto)
- `supabase-modulos.sql` — modulos_treinamento, perguntas_avaliacao, progresso_modulos
- `supabase-notificacoes.sql` — notificacoes
- `supabase-acesso-equipamentos.sql` — acesso_equipamentos
- `supabase-capa-treinamento.sql` — coluna capa_url em treinamentos
- `supabase-storage-capas.sql` — bucket capas-treinamentos no Storage

## Criação de Usuários (Bug Corrigido)
- Usar `upsert` (não `insert`) ao criar profile após createUser
- Motivo: Supabase trigger cria profile com role='colaborador' automaticamente; upsert sobrescreve com o role correto
- Arquivo: `src/app/api/admin/usuarios/route.ts`

## Páginas Admin
- `/admin-usuarios` — CRUD completo, ComboBox para funcao/setor, restrições por role
- `/admin-treinamentos` — CRUD + módulos com vídeos + avaliações múltipla escolha
- `/admin-bonificacoes` — adicionar/remover pontos, dispara notificação automática

## Páginas Colaborador
- `/treinamentos` — lista de treinamentos atribuídos
- `/treinamentos/[id]` — player de vídeo com módulos e avaliações
- `/biblioteca` — equipamentos com link para treinamentos
- `/perfil` — editar nome, cargo, setor, senha

## Observações Importantes
- Credenciais Supabase hardcoded no código (Vercel env vars corrompem em Hobby plan)
- `export const dynamic = 'force-dynamic'` em todos os layouts/pages com dados do Supabase
- Role é passado como prop do server layout para o Sidebar (nunca buscar role no client com anon key — RLS bloqueia)
- Middleware: pula rotas /api/* para evitar timeout em cascata
