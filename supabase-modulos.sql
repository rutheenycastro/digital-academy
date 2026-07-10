-- Tabela de módulos de cada treinamento
CREATE TABLE IF NOT EXISTS modulos_treinamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treinamento_id UUID REFERENCES treinamentos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  video_url TEXT,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  tem_avaliacao BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de perguntas de avaliação de cada módulo
CREATE TABLE IF NOT EXISTS perguntas_avaliacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID REFERENCES modulos_treinamento(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  opcoes JSONB NOT NULL DEFAULT '[]',
  resposta_correta INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de progresso por módulo (para saber quem assistiu cada vídeo)
CREATE TABLE IF NOT EXISTS progresso_modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos_treinamento(id) ON DELETE CASCADE,
  assistido BOOLEAN DEFAULT false,
  nota_avaliacao INTEGER,
  concluido BOOLEAN DEFAULT false,
  concluido_em TIMESTAMPTZ,
  UNIQUE(user_id, modulo_id)
);

-- Policies (RLS desabilitado para service role, mas adicionar para leitura do usuário)
ALTER TABLE modulos_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_modulos ENABLE ROW LEVEL SECURITY;

-- Colaboradores podem ver módulos de treinamentos ativos
CREATE POLICY "modulos_select" ON modulos_treinamento FOR SELECT USING (true);
CREATE POLICY "perguntas_select" ON perguntas_avaliacao FOR SELECT USING (true);

-- Cada usuário vê e edita seu próprio progresso
CREATE POLICY "progresso_select" ON progresso_modulos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progresso_insert" ON progresso_modulos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progresso_update" ON progresso_modulos FOR UPDATE USING (auth.uid() = user_id);
