import React from 'react';
import { RiskStatus, UserSettings } from '../types';
import { Lock, Unlock, DollarSign } from 'lucide-react';

interface Props {
  riskStatus: RiskStatus;
  settings: UserSettings;
}

const RiskMonitor: React.FC<Props> = ({ riskStatus, settings }) => {
  const pnlColor = riskStatus.currentPnL >= 0 ? 'text-profit-green' : 'text-profit-red';
  const remainingLoss = settings.maxDailyLoss + riskStatus.currentPnL; // Assuming PnL is negative on loss
  const lossPercentage = Math.min(100, (Math.abs(Math.min(0, riskStatus.currentPnL)) / settings.maxDailyLoss) * 100);

  return (
    <div className="bg-profit-card border border-profit-border p-4 rounded-lg">
      <h3 className="text-profit-muted text-sm font-bold uppercase flex items-center gap-2 mb-4">
        {riskStatus.isBlocked ? <Lock className="w-4 h-4 text-profit-red" /> : <Unlock className="w-4 h-4 text-profit-green" />}
        Gestão de Risco
      </h3>

      <div className="mb-6">
        <span className="text-xs text-profit-muted">Resultado do Dia</span>
        <div className={`text-3xl font-bold ${pnlColor} flex items-center`}>
          <span className="text-lg mr-1">R$</span>
          {riskStatus.currentPnL.toFixed(2)}
        </div>
      </div>

      <div className="space-y-4">
        <div>
           <div className="flex justify-between text-xs mb-1">
             <span className="text-profit-text">Drawdown Diário</span>
             <span className={lossPercentage > 80 ? 'text-profit-red' : 'text-profit-muted'}>
                {lossPercentage.toFixed(0)}% do limite
             </span>
           </div>
           <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
             <div 
                className={`h-full ${lossPercentage > 80 ? 'bg-profit-red' : 'bg-profit-yellow'}`}
                style={{ width: `${lossPercentage}%` }}
             />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-[#1a1a1e] p-2 rounded border border-profit-border">
                <span className="text-profit-muted text-xs block">Limite Diário</span>
                <span className="font-mono text-profit-red">-R$ {settings.maxDailyLoss}</span>
            </div>
            <div className="bg-[#1a1a1e] p-2 rounded border border-profit-border">
                <span className="text-profit-muted text-xs block">Risco / Trade</span>
                <span className="font-mono text-profit-yellow">R$ {settings.maxRiskPerTrade}</span>
            </div>
        </div>
      </div>
      
      {riskStatus.isBlocked && (
          <div className="mt-4 text-center text-xs text-profit-red bg-red-900/10 p-2 rounded border border-profit-red/30">
            Limite de perda atingido. Operações bloqueadas.
          </div>
      )}
    </div>
  );
};

export default RiskMonitor;