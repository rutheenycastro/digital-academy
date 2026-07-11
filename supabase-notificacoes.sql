-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'treinamento_concluido', 'bonificacao', 'ideia', 'sistema'
  titulo TEXT NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Cada usuário só vê suas próprias notificações
CREATE POLICY "notificacoes_select" ON notificacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notificacoes_update" ON notificacoes FOR UPDATE USING (auth.uid() = user_id);
