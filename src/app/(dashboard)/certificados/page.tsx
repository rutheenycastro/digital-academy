import { createClient } from '@/lib/supabase/server'
import { Award, Download, Calendar, Shield } from 'lucide-react'

export default async function CertificadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: certificados } = await supabase
    .from('certificados')
    .select('*, treinamento:treinamentos(titulo, categoria)')
    .eq('user_id', user?.id ?? '')
    .order('emitido_em', { ascending: false })

  const mockCerts = [
    { id: '1', numero: 'DA-2025-001', titulo: 'NR-12 — Segurança em Máquinas', categoria: 'Segurança', emitido: '15/03/2025', validade: '15/03/2026', tipo: 'vale' },
    { id: '2', numero: 'DA-2025-002', titulo: 'Operação Impressora UV', categoria: 'Impressão', emitido: '02/04/2025', validade: null, tipo: 'interno' },
    { id: '3', numero: 'DA-2025-003', titulo: 'Router CNC — Nível Básico', categoria: 'Corte', emitido: '20/05/2025', validade: '20/05/2026', tipo: 'interno' },
  ]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Meus Certificados</h1>
        <p className="text-sm text-gray-500 mt-0.5">Certificados emitidos ao concluir treinamentos.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total emitidos', value: mockCerts.length, icon: Award, color: 'text-[#7ED321]' },
          { label: 'Requeridos Vale', value: mockCerts.filter(c => c.tipo === 'vale').length, icon: Shield, color: 'text-blue-500' },
          { label: 'Vencendo em 30d', value: 0, icon: Calendar, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <Icon size={20} className={color} />
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {mockCerts.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Award size={22} className="text-[#7ED321]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.titulo}</p>
                {c.tipo === 'vale' && (
                  <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Vale</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400">N° {c.numero} · Emitido em {c.emitido}</p>
              {c.validade && <p className="text-[10px] text-amber-600">Válido até {c.validade}</p>}
            </div>
            <button className="flex items-center gap-1.5 text-[11px] px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#7ED321] hover:text-[#5fa018] transition-colors flex-shrink-0">
              <Download size={12} /> PDF
            </button>
          </div>
        ))}

        {mockCerts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Award size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum certificado emitido ainda.</p>
            <p className="text-xs mt-1">Conclua treinamentos para receber certificados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
