import React from 'react';
import { PtaxZone, MarketData } from '../types';
import { Crosshair } from 'lucide-react';

interface Props {
  zones: PtaxZone[];
  currentPrice: number;
}

const PtaxPanel: React.FC<Props> = ({ zones, currentPrice }) => {
  return (
    <div className="bg-profit-card border border-profit-border p-4 rounded-lg">
      <h3 className="text-profit-muted text-sm font-bold uppercase flex items-center gap-2 mb-4">
        <Crosshair className="w-4 h-4 text-blue-400" /> Radar PTAX
      </h3>

      <div className="space-y-3">
        {zones.map((zone, idx) => {
          const dist = Math.abs(currentPrice - zone.price);
          const isClose = dist < 5;
          
          let colorClass = 'text-profit-muted';
          if (zone.type === 'ATTRACTION') colorClass = 'text-blue-400';
          if (zone.type === 'DEFENSE') colorClass = 'text-profit-red';
          if (zone.type === 'NEUTRAL') colorClass = 'text-profit-yellow';

          return (
            <div key={idx} className={`p-3 rounded border ${isClose ? 'bg-blue-900/20 border-blue-500/50' : 'bg-[#1a1a1e] border-profit-border'} transition-all`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-profit-text">{zone.timeLabel}</span>
                <span className={`text-xs px-2 py-0.5 rounded bg-opacity-20 ${colorClass} bg-gray-700`}>
                  {zone.type}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-mono font-bold text-profit-text">{zone.price.toFixed(1)}</span>
                <span className="text-xs text-profit-muted">
                    Prob: <span className={zone.probability === 'HIGH' ? 'text-profit-green' : 'text-profit-yellow'}>{zone.probability}</span>
                </span>
              </div>
              {isClose && (
                  <div className="mt-2 text-xs text-blue-300 animate-pulse">
                      Preço na zona de interesse!
                  </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-2 bg-gray-800/50 rounded text-xs text-profit-muted leading-tight">
        Zonas de PTAX costumam atrair o preço para formação da taxa oficial do Banco Central. Cuidado com volatilidade nestes pontos.
      </div>
    </div>
  );
};

export default PtaxPanel;