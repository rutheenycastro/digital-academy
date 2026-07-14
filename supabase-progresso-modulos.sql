-- Tabela de progresso por módulo
CREATE TABLE IF NOT EXISTS progresso_modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treinamento_id UUID REFERENCES treinamentos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos_treinamento(id) ON DELETE CASCADE,
  concluido BOOLEAN DEFAULT false,
  respostas JSONB,
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, modulo_id)
);

ALTER TABLE progresso_modulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progresso_modulos_select" ON progresso_modulos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progresso_modulos_insert" ON progresso_modulos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progresso_modulos_update" ON progresso_modulos FOR UPDATE USING (auth.uid() = user_id);
