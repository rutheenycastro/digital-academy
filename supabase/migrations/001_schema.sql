-- ============================================================
-- Digital Academy — Schema completo do banco de dados
-- Execute no Supabase SQL Editor (painel > SQL Editor)
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- PERFIS DE USUÁRIO
-- ============================================================
create table public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  nome          text not null,
  email         text not null,
  funcao        text not null default '',
  setor         text not null default '',
  role          text not null default 'colaborador' check (role in ('colaborador','gestor','rh','admin')),
  avatar_url    text,
  pontos        integer not null default 0,
  nivel         integer not null default 1,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuário vê o próprio perfil" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Gestores veem todos os perfis" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin'))
  );

create policy "Usuário atualiza o próprio perfil" on public.profiles
  for update using (auth.uid() = user_id);

-- Trigger: cria perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- EQUIPAMENTOS
-- ============================================================
create table public.equipamentos (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  descricao   text,
  categoria   text not null,
  imagem_url  text,
  manual_url  text,
  created_at  timestamptz not null default now()
);

alter table public.equipamentos enable row level security;
create policy "Todos leem equipamentos" on public.equipamentos for select using (true);
create policy "Admin gerencia equipamentos" on public.equipamentos
  for all using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TREINAMENTOS
-- ============================================================
create table public.treinamentos (
  id               uuid primary key default uuid_generate_v4(),
  titulo           text not null,
  descricao        text not null default '',
  categoria        text not null,
  equipamento_id   uuid references public.equipamentos(id),
  carga_horaria    integer not null default 1,
  pontos_conclusao integer not null default 100,
  obrigatorio      boolean not null default false,
  requerido_vale   boolean not null default false,
  thumbnail_url    text,
  ativo            boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.treinamentos enable row level security;
create policy "Todos leem treinamentos ativos" on public.treinamentos for select using (ativo = true);
create policy "Admin gerencia treinamentos" on public.treinamentos
  for all using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','gestor')));

-- ============================================================
-- MÓDULOS
-- ============================================================
create table public.modulos (
  id               uuid primary key default uuid_generate_v4(),
  treinamento_id   uuid references public.treinamentos(id) on delete cascade not null,
  titulo           text not null,
  descricao        text,
  tipo             text not null check (tipo in ('video','texto','quiz','pratico')),
  video_url        text,
  conteudo         text,
  ordem            integer not null default 1,
  duracao_minutos  integer not null default 10,
  created_at       timestamptz not null default now()
);

alter table public.modulos enable row level security;
create policy "Todos leem módulos" on public.modulos for select using (true);
create policy "Admin gerencia módulos" on public.modulos
  for all using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','gestor')));

-- ============================================================
-- PROGRESSO DE TREINAMENTO
-- ============================================================
create table public.progresso_treinamentos (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  treinamento_id   uuid references public.treinamentos(id) on delete cascade not null,
  status           text not null default 'nao_iniciado' check (status in ('nao_iniciado','em_andamento','concluido')),
  percentual       integer not null default 0 check (percentual >= 0 and percentual <= 100),
  pontos_ganhos    integer not null default 0,
  nota_final       numeric(4,2),
  concluido_em     timestamptz,
  created_at       timestamptz not null default now(),
  unique(user_id, treinamento_id)
);

alter table public.progresso_treinamentos enable row level security;
create policy "Usuário vê próprio progresso" on public.progresso_treinamentos
  for select using (auth.uid() = user_id);
create policy "Gestores veem todo progresso" on public.progresso_treinamentos
  for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));
create policy "Usuário atualiza próprio progresso" on public.progresso_treinamentos
  for all using (auth.uid() = user_id);

-- ============================================================
-- AVALIAÇÕES / QUIZZES
-- ============================================================
create table public.avaliacoes (
  id              uuid primary key default uuid_generate_v4(),
  treinamento_id  uuid references public.treinamentos(id) on delete cascade not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  nota            numeric(4,2) not null,
  pontos          integer not null default 0,
  respostas       jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

alter table public.avaliacoes enable row level security;
create policy "Usuário vê próprias avaliações" on public.avaliacoes
  for select using (auth.uid() = user_id);
create policy "Gestores veem todas avaliações" on public.avaliacoes
  for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));
create policy "Usuário cria avaliações" on public.avaliacoes
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- CERTIFICADOS
-- ============================================================
create table public.certificados (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  treinamento_id  uuid references public.treinamentos(id) on delete cascade not null,
  numero          text not null unique,
  emitido_em      timestamptz not null default now(),
  valido_ate      timestamptz,
  url_pdf         text,
  unique(user_id, treinamento_id)
);

alter table public.certificados enable row level security;
create policy "Usuário vê próprios certificados" on public.certificados
  for select using (auth.uid() = user_id);
create policy "Gestores veem todos certificados" on public.certificados
  for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));
create policy "Sistema cria certificados" on public.certificados
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- RACs
-- ============================================================
create table public.racs (
  id              uuid primary key default uuid_generate_v4(),
  numero          text not null unique,
  titulo          text not null,
  descricao       text not null default '',
  user_id         uuid references auth.users(id) not null,
  responsavel_id  uuid references auth.users(id),
  status          text not null default 'aberta' check (status in ('aberta','em_analise','concluida')),
  prazo           date not null,
  prioridade      text not null default 'media' check (prioridade in ('baixa','media','alta','critica')),
  requerido_vale  boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.racs enable row level security;
create policy "Usuário vê RACs relacionadas" on public.racs
  for select using (auth.uid() = user_id or auth.uid() = responsavel_id);
create policy "Gestores veem todas RACs" on public.racs
  for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));
create policy "Usuário cria RAC" on public.racs for insert with check (auth.uid() = user_id);
create policy "Responsável atualiza RAC" on public.racs
  for update using (auth.uid() = responsavel_id or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));

-- ============================================================
-- ATIVIDADES (Melhorias 5S)
-- ============================================================
create table public.atividades (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  tipo        text not null check (tipo in ('5s','melhoria','seguranca','producao')),
  titulo      text not null,
  descricao   text not null default '',
  imagem_url  text,
  pontos      integer not null default 50,
  curtidas    integer not null default 0,
  aprovado    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.atividades enable row level security;
create policy "Todos veem atividades aprovadas" on public.atividades
  for select using (aprovado = true or auth.uid() = user_id);
create policy "Gestores veem todas atividades" on public.atividades
  for select using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));
create policy "Usuário cria atividade" on public.atividades for insert with check (auth.uid() = user_id);
create policy "Gestor aprova atividade" on public.atividades
  for update using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('gestor','rh','admin')));

-- ============================================================
-- CONQUISTAS
-- ============================================================
create table public.conquistas (
  id                  uuid primary key default uuid_generate_v4(),
  nome                text not null,
  descricao           text not null,
  icone               text not null default '🏅',
  pontos_necessarios  integer,
  criterio            jsonb not null default '{}'
);

create table public.conquistas_usuarios (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  conquista_id    uuid references public.conquistas(id) on delete cascade not null,
  conquistado_em  timestamptz not null default now(),
  unique(user_id, conquista_id)
);

alter table public.conquistas enable row level security;
alter table public.conquistas_usuarios enable row level security;
create policy "Todos leem conquistas" on public.conquistas for select using (true);
create policy "Usuário vê próprias conquistas" on public.conquistas_usuarios
  for select using (auth.uid() = user_id);

-- ============================================================
-- SEED: Dados iniciais de conquistas
-- ============================================================
insert into public.conquistas (nome, descricao, icone, pontos_necessarios, criterio) values
  ('Primeira avaliação', 'Realizou a primeira avaliação', '🎯', null, '{"tipo":"avaliacao","quantidade":1}'),
  ('Segurança em dia', 'Concluiu todos os cursos obrigatórios de segurança', '🔒', null, '{"tipo":"seguranca"}'),
  ('Primeira melhoria', 'Postou a primeira ação de melhoria', '💡', null, '{"tipo":"atividade","quantidade":1}'),
  ('Velocista', 'Concluiu 3 treinamentos em um mês', '⚡', null, '{"tipo":"treinamentos_mes","quantidade":3}'),
  ('Top 1 do mês', 'Ficou em 1° lugar no ranking mensal', '🏆', null, '{"tipo":"ranking","posicao":1}'),
  ('Colaborador 10', 'Concluiu 100% dos treinamentos disponíveis', '🌟', null, '{"tipo":"conclusao_total"}'),
  ('Bronze', 'Acumulou 500 pontos', '🥉', 500, '{"tipo":"pontos"}'),
  ('Prata', 'Acumulou 1500 pontos', '🥈', 1500, '{"tipo":"pontos"}'),
  ('Ouro', 'Acumulou 3000 pontos', '🥇', 3000, '{"tipo":"pontos"}');

-- ============================================================
-- SEED: Equipamentos
-- ============================================================
insert into public.equipamentos (nome, descricao, categoria) values
  ('Impressora UV', 'Impressora UV de grande formato para sublimação e impressão direta', 'Impressão'),
  ('Router CNC', 'Roteador CNC para corte e fresamento de materiais rígidos', 'Corte'),
  ('Laser CO2', 'Máquina de corte e gravação a laser CO2 60W', 'Corte'),
  ('Plotter de Recorte', 'Plotter de recorte de vinil e adesivos', 'Corte'),
  ('Laminadora', 'Laminadora a frio e a quente para acabamentos', 'Acabamento'),
  ('Bordadeira CNC', 'Bordadeira computadorizada de múltiplas agulhas', 'Malharia');
