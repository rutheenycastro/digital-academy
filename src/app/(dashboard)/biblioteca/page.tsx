import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { BookOpen, Wrench, Lock } from 'lucide-react'
import Link from 'next/link'

const SUPABASE_URL = 'https://hipuneooqzrpwbcyfzkp.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHVuZW9vcXpycHdiY3lmemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgxOTM4NywiZXhwIjoyMDk3Mzk1Mzg3fQ.F2nWXapFhZYTL0P4NciUBLFE1xPdfQaIi5ADyrZX9dA'

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

export const dynamic = 'force-dynamic'

const EQUIPAMENTOS = [
  { id: 'impressora-uv', nome: 'Impressora UV', categoria: 'Impressão', descricao: 'Impressora UV de grande formato para materiais rígidos e flexíveis.' },
  { id: 'router-cnc', nome: 'Router CNC', categoria: 'Corte', descricao: 'Roteador CNC para corte e usinagem de MDF, acrílico e madeira.' },
  { id: 'laser-co2', nome: 'Laser CO2', categoria: 'Corte', descricao: 'Máquina de corte e gravação a laser para materiais variados.' },
  { id: 'plotter-recorte', nome: 'Plotter de Recorte', categoria: 'Corte', descricao: 'Plotter para recorte de vinil adesivo e papel.' },
  { id: 'laminadora', nome: 'Laminadora', categoria: 'Acabamento', descricao: 'Laminadora para acabamento de impressões com frio ou calor.' },
  { id: 'bordadeira-cnc', nome: 'Bordadeira CNC', categoria: 'Malharia', descricao: 'Bordadeira computadorizada para tecidos e uniformes.' },
  { id: 'fargo-dtc1250e', nome: 'FARGO DTC1250e', categoria: 'Impressão de Crachá', descricao: 'Impressora de crachás e cartões PVC de alta qualidade.' },
]

const categoriaColor: Record<string, string> = {
  'Impressão': 'bg-blue-100 text-blue-700',
  'Corte': 'bg-red-100 text-red-700',
  'Acabamento': 'bg-amber-100 text-amber-700',
  'Malharia': 'bg-purple-100 text-purple-700',
  'Impressão de Crachá': 'bg-indigo-100 text-indigo-700',
}

export default async function BibliotecaPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await admin()
    .from('profiles')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  const isGestor = ['admin', 'gestor', 'rh'].includes(profile?.role ?? '')

  // Gestores veem tudo; colaboradores veem só o que têm acesso
  let equipamentosVisiveis = EQUIPAMENTOS
  if (!isGestor) {
    const { data: acessos } = await admin()
      .from('acesso_equipamentos')
      .select('equipamento_id, liberado')
      .eq('user_id', user!.id)
      .eq('liberado', true)

    const idsLiberados = new Set((acessos ?? []).map(a => a.equipamento_id))
    equipamentosVisiveis = EQUIPAMENTOS.filter(eq => idsLiberados.has(eq.id))
  }

  // Busca treinamentos para vincular pelo nome do equipamento
  const { data: treinamentos } = await admin()
    .from('treinamentos')
    .select('id, titulo')
    .eq('ativo', true)

  function encontrarTreinamento(nomeEquip: string) {
    return treinamentos?.find(t =>
      t.titulo.toLowerCase().includes(nomeEquip.toLowerCase()) ||
      nomeEquip.toLowerCase().includes(t.titulo.toLowerCase())
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Biblioteca de Máquinas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manuais, vídeos e treinamentos por equipamento.</p>
      </div>

      {equipamentosVisiveis.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <Lock size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">Nenhum equipamento liberado ainda</p>
          <p className="text-xs text-gray-400 mt-1">Aguarde seu gestor liberar o acesso aos equipamentos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {equipamentosVisiveis.map(eq => {
            const treinamento = encontrarTreinamento(eq.nome)
            return (
              <div key={eq.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#7ED321] transition-colors group">
                <div className="h-28 bg-gray-900 flex items-center justify-center">
                  <Wrench size={36} className="text-[#7ED321] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{eq.nome}</h3>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${categoriaColor[eq.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                      {eq.categoria}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">{eq.descricao}</p>
                  <div className="flex gap-2">
                    {treinamento ? (
                      <Link href={`/treinamentos/${treinamento.id}`}
                        className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-[#7ED321] hover:bg-[#6bbf1a] rounded-lg text-black font-semibold transition-colors">
                        <BookOpen size={11} /> Ver treinamento
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-gray-100 rounded-lg text-gray-400">
                        <BookOpen size={11} /> Sem treinamento vinculado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
