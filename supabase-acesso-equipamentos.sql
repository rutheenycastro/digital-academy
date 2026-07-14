-- Tabela de acesso a equipamentos por colaborador
CREATE TABLE IF NOT EXISTS acesso_equipamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  equipamento_id TEXT NOT NULL,
  liberado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, equipamento_id)
);

ALTER TABLE acesso_equipamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_equipamentos_select" ON acesso_equipamentos FOR SELECT USING (auth.uid() = user_id);
