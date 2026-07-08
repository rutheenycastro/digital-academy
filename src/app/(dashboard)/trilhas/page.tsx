import { Route, Lock, CheckCircle, ChevronRight } from 'lucide-react'

const trilhas = [
  {
    id: 1,
    funcao: 'Operador de Impressão',
    cor: 'bg-blue-500',
    total: 5,
    concluidos: 3,
    modulos: [
      { nome: 'Segurança na operação UV', concluido: true },
      { nome: 'Calibração de cores e perfis ICC', concluido: true },
      { nome: 'Manutenção preventiva diária', concluido: true },
      { nome: 'NR-12 — Impressoras de grande formato', concluido: false },
      { nome: 'Resolução de problemas e banding', concluido: false },
    ]
  },
  {
    id: 2,
    funcao: 'Operador de Corte CNC',
    cor: 'bg-red-500',
    total: 4,
    concluidos: 1,
    modulos: [
      { nome: 'Fundamentos do Router CNC', concluido: true },
      { nome: 'Softwares de corte (ArtCAM/VCarve)', concluido: false },
      { nome: 'NR-12 — Máquinas de corte', concluido: false },
      { nome: 'Configuração de brocas e fresas', concluido: false },
    ]
  },
  {
    id: 3,
    funcao: 'Acabamento e Laminação',
    cor: 'bg-amber-500',
    total: 3,
    concluidos: 0,
    modulos: [
      { nome: 'Tipos de laminados e aplicações', concluido: false },
      { nome: 'Operação da laminadora a frio', concluido: false },
      { nome: 'Controle de qualidade no acabamento', concluido: false },
    ]
  },
  {
    id: 4,
    funcao: 'Bordadeira / Malharia',
    cor: 'bg-purple-500',
    total: 4,
    concluidos: 0,
    modulos: [
      { nome: 'Configuração de matrizes de bordado', concluido: false },
      { nome: 'Tipos de linha e agulha', concluido: false },
      { nome: 'Manutenção da bordadeira CNC', concluido: false },
      { nome: 'Controle de qualidade em bordados', concluido: false },
    ]
  },
]

export default function TrilhasPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Trilhas por Função</h1>
        <p className="text-sm text-gray-500 mt-0.5">Percurso de aprendizado personalizado para cada cargo.</p>
      </div>

      <div className="space-y-4">
        {trilhas.map(t => {
          const pct = Math.round((t.concluidos / t.total) * 100)
          return (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${t.cor} flex items-center justify-center`}>
                    <Route size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{t.funcao}</h2>
                    <p className="text-[11px] text-gray-500">{t.concluidos}/{t.total} módulos concluídos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{pct}%</p>
                  <p className="text-[10px] text-gray-400">concluído</p>
                </div>
              </div>

              <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                <div className="h-full rounded-full bg-[#7ED321] transition-all" style={{ width: `${pct}%` }} />
              </div>

              <div className="space-y-2">
                {t.modulos.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-t border-gray-50 first:border-0">
                    {m.concluido
                      ? <CheckCircle size={14} className="text-[#7ED321] flex-shrink-0" />
                      : i === t.concluidos
                        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-[#7ED321] flex-shrink-0" />
                        : <Lock size={13} className="text-gray-300 flex-shrink-0" />
                    }
                    <span className={`text-xs flex-1 ${m.concluido ? 'text-gray-400 line-through' : i === t.concluidos ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                      {m.nome}
                    </span>
                    {i === t.concluidos && (
                      <button className="flex items-center gap-1 text-[10px] text-[#7ED321] font-semibold">
                        Iniciar <ChevronRight size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
