-- Adiciona coluna de capa ao treinamento
ALTER TABLE treinamentos ADD COLUMN IF NOT EXISTS capa_url TEXT;
