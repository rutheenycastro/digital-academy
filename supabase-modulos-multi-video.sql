-- Adiciona coluna de videos multiplos nos modulos
ALTER TABLE modulos_treinamento ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';
