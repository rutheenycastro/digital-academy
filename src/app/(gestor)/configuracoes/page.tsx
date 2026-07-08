import { Settings, Bell, Shield, Palette, Building2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie as configurações da plataforma.</p>
      </div>

      <div className="space-y-4">
        {/* Empresa */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={15} className="text-[#7ED321]" />
            <h2 className="text-sm font-semibold text-gray-900">Empresa</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Nome da empresa', value: 'Digital Comunicação Visual' },
              { label: 'CNPJ', value: '00.000.000/0001-00' },
              { label: 'Setor principal', value: 'Comunicação Visual / Gráfica' },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</label>
                <input defaultValue={value} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#7ED321]" />
              </div>
            ))}
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-[#7ED321]" />
            <h2 className="text-sm font-semibold text-gray-900">Notificações</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Nova ideia de melhoria submetida', checked: true },
              { label: 'RAC aberta com prioridade crítica', checked: true },
              { label: 'Colaborador conclui treinamento', checked: false },
              { label: 'Vencimento de certificados (30 dias)', checked: true },
            ].map(({ label, checked }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-700">{label}</span>
                <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-[#7ED321]' : 'bg-gray-200'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} style={{ left: checked ? '18px' : '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} className="text-[#7ED321]" />
            <h2 className="text-sm font-semibold text-gray-900">Segurança e Acesso</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Exigir confirmação de e-mail no cadastro', checked: false },
              { label: 'Permitir auto-cadastro de colaboradores', checked: true },
              { label: 'Aprovação de ideias obrigatória antes da execução', checked: true },
            ].map(({ label, checked }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-700">{label}</span>
                <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-[#7ED321]' : 'bg-gray-200'}`}>
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: checked ? '18px' : '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full bg-[#7ED321] text-black text-sm font-bold py-3 rounded-xl hover:bg-[#6bb81c] transition-colors">
          Salvar alterações
        </button>
      </div>
    </div>
  )
}
