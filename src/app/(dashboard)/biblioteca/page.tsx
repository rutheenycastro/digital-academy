import { createClient } from '@/lib/supabase/server'
import { BookOpen, Wrench, Download } from 'lucide-react'

const categoriaColor: Record<string, string> = {
  'Impressão': 'bg-blue-100 text-blue-700',
  'Corte': 'bg-red-100 text-red-700',
  'Acabamento': 'bg-amber-100 text-amber-700',
  'Malharia': 'bg-purple-100 text-purple-700',
}

export default async function BibliotecaPage() {
  const supabase = await createClient()
  const { data: equipamentos } = await supabase.from('equipamentos').select('*').order('nome')

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Biblioteca de Máquinas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manuais, vídeos e treinamentos por equipamento.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {equipamentos?.map(eq => (
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
                <button className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
                  <BookOpen size={11} /> Ver treinamento
                </button>
                {eq.manual_url && (
                  <button className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 border border-gray-200 hover:border-[#7ED321] rounded-lg text-gray-600 transition-colors">
                    <Download size={11} /> Manual
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {(!equipamentos || equipamentos.length === 0) && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Wrench size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum equipamento cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
