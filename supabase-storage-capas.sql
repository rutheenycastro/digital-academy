-- Cria bucket publico para capas de treinamentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('capas-treinamentos', 'capas-treinamentos', true)
ON CONFLICT (id) DO NOTHING;

-- Permite que admins/gestores façam upload
CREATE POLICY "upload_capas" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'capas-treinamentos');

-- Permite leitura publica das capas
CREATE POLICY "leitura_publica_capas" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'capas-treinamentos');

-- Permite deletar (para substituir capa)
CREATE POLICY "deletar_capas" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'capas-treinamentos');
