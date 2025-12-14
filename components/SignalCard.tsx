import React from 'react';
import { TradeSignal, SignalType, AssetType } from '../types';
import { AlertCircle, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { ASSET_CONFIG } from '../constants';

interface Props {
  signal: TradeSignal | null;
  isBlocked: boolean;
  asset: AssetType;
  contracts: number;
}

const SignalCard: React.FC<Props> = ({ signal, isBlocked, asset, contracts }) => {
  if (isBlocked) {
    return (
      <div className="bg-profit-card border border-profit-red p-6 rounded-lg text-center flex flex-col items-center justify-center min-h-[250px]">
        <AlertCircle className="w-16 h-16 text-profit-red mb-4" />
        <h2 className="text-xl font-bold text-profit-red">TRADING BLOQUEADO</h2>
        <p className="text-profit-muted mt-2">Limite de perda diária atingido. Feche a plataforma e volte amanhã.</p>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="bg-profit-card border border-profit-border p-6 rounded-lg text-center flex flex-col items-center justify-center min-h-[250px]">
        <div className="animate-pulse">
            <ShieldCheck className="w-12 h-12 text-profit-muted mb-4 opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-profit-text">AGUARDANDO OPORTUNIDADE</h2>
        <p className="text-profit-muted mt-2 max-w-xs">
          O sistema está analisando o fluxo e estrutura. Nenhuma confluência clara no momento.
        </p>
        <p className="text-xs text-profit-yellow mt-4 font-mono">PACIÊNCIA PAGA</p>
      </div>
    );
  }

  const isBuy = signal.type === SignalType.BUY;
  const mainColor = isBuy ? 'text-profit-green' : 'text-profit-red';
  const borderColor = isBuy ? 'border-profit-green' : 'border-profit-red';
  const bgBadge = isBuy ? 'bg-green-900/30' : 'bg-red-900/30';

  const valuePerPoint = ASSET_CONFIG[asset].valuePerPoint * contracts;
  const riskAmount = Math.abs(signal.entryPrice - signal.stopLoss) * valuePerPoint;
  const rewardAmount = Math.abs(signal.targetFinal - signal.entryPrice) * valuePerPoint;

  return (
    <div className={`bg-profit-card border-l-4 ${borderColor} p-6 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`px-3 py-1 rounded text-sm font-bold tracking-wider ${bgBadge} ${mainColor}`}>
            SINAL DE {signal.type}
          </span>
          <h3 className="text-3xl font-bold text-white mt-2">{signal.entryPrice.toFixed(1)}</h3>
        </div>
        <div className="text-right">
            <div className="text-sm text-profit-muted">Risco / Retorno</div>
            <div className="text-xl font-mono text-profit-text">1 : {signal.riskRewardRatio.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1a1a1e] p-3 rounded border border-profit-border">
            <div className="flex items-center gap-2 text-profit-red text-sm font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> STOP LOSS
            </div>
            <div className="text-xl font-mono">{signal.stopLoss.toFixed(1)}</div>
            <div className="text-xs text-profit-muted">- R$ {riskAmount.toFixed(2)}</div>
        </div>
        <div className="bg-[#1a1a1e] p-3 rounded border border-profit-border">
            <div className="flex items-center gap-2 text-profit-green text-sm font-bold mb-1">
                <Target className="w-4 h-4" /> ALVO FINAL
            </div>
            <div className="text-xl font-mono">{signal.targetFinal.toFixed(1)}</div>
            <div className="text-xs text-profit-muted">+ R$ {rewardAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-[#1a1a1e] p-4 rounded border border-profit-border">
        <h4 className="text-profit-muted text-xs uppercase font-bold mb-2">Análise do Copiloto</h4>
        <p className="text-profit-text text-sm leading-relaxed">
            {signal.reason}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-profit-yellow bg-yellow-900/20 p-2 rounded">
        <AlertCircle className="w-4 h-4" />
        <span>Este sinal é educativo. Você é responsável pela execução.</span>
      </div>
    </div>
  );
};

export default SignalCard;