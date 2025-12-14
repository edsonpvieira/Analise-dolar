import React from 'react';
import { UserSettings, AssetType } from '../types';
import { Settings, Save } from 'lucide-react';

interface Props {
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, onUpdate }) => {
  const handleChange = (field: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <div className="bg-profit-card border border-profit-border p-4 rounded-lg h-full">
      <h3 className="text-profit-muted text-sm font-bold uppercase flex items-center gap-2 mb-6">
        <Settings className="w-4 h-4" /> Configurações Operacionais
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-profit-muted mb-1">Ativo</label>
          <select 
            value={settings.asset}
            onChange={(e) => handleChange('asset', e.target.value)}
            className="w-full bg-[#121214] border border-profit-border text-profit-text rounded p-2 focus:border-profit-green outline-none"
          >
            <option value={AssetType.WDO}>WDO (Mini Dólar)</option>
            <option value={AssetType.DOL}>DOL (Dólar Cheio)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-profit-muted mb-1">Contratos</label>
          <input 
            type="number"
            min="1"
            value={settings.contracts}
            onChange={(e) => handleChange('contracts', parseInt(e.target.value))}
            className="w-full bg-[#121214] border border-profit-border text-profit-text rounded p-2 focus:border-profit-green outline-none"
          />
        </div>

        <div>
            <label className="block text-xs text-profit-muted mb-1">Stop Max / Trade (R$)</label>
            <input 
                type="number"
                value={settings.maxRiskPerTrade}
                onChange={(e) => handleChange('maxRiskPerTrade', parseFloat(e.target.value))}
                className="w-full bg-[#121214] border border-profit-border text-profit-red rounded p-2 focus:border-profit-red outline-none"
            />
        </div>

        <div>
            <label className="block text-xs text-profit-muted mb-1">Loss Diário Max (R$)</label>
            <input 
                type="number"
                value={settings.maxDailyLoss}
                onChange={(e) => handleChange('maxDailyLoss', parseFloat(e.target.value))}
                className="w-full bg-[#121214] border border-profit-border text-profit-red rounded p-2 focus:border-profit-red outline-none"
            />
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center text-xs text-profit-green gap-2">
         <Save className="w-4 h-4" /> Configurações salvas automaticamente
      </div>
    </div>
  );
};

export default SettingsPanel;