import React from 'react';
import { TradingZones, MarketData } from '../types';
import { Target, TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';

interface Props {
  zones: TradingZones;
  currentPrice: number;
}

const RealTimeAnalysis: React.FC<Props> = ({ zones, currentPrice }) => {
  const isPriceInBuy = currentPrice >= zones.buyRegion.min && currentPrice <= zones.buyRegion.max;
  const isPriceInSell = currentPrice >= zones.sellRegion.min && currentPrice <= zones.sellRegion.max;

  return (
    <div className="bg-profit-card border border-profit-border p-5 rounded-lg mb-6 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white text-md font-bold uppercase flex items-center gap-2 tracking-wide">
          <Maximize2 className="w-5 h-5 text-blue-400" /> Análise em Tempo Real
        </h3>
        <span className="text-xs font-mono text-profit-muted bg-[#121214] px-2 py-1 rounded border border-profit-border">
            {zones.trendContext}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COMPRA */}
        <div className={`relative p-4 rounded-lg border-l-4 transition-all duration-300 ${isPriceInBuy ? 'bg-green-900/20 border-profit-green shadow-[0_0_15px_rgba(0,179,126,0.1)]' : 'bg-[#1a1a1e] border-profit-green/40'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-profit-green font-bold uppercase text-sm">
                <TrendingUp className="w-4 h-4" /> Melhor Compra
            </div>
            <span className="text-[10px] text-profit-green border border-profit-green/30 px-1.5 py-0.5 rounded uppercase">
                Força: {zones.buyRegion.strength}
            </span>
          </div>
          
          <div className="flex items-end gap-3">
             <span className="text-2xl font-mono font-bold text-white">
                {zones.buyRegion.min.toFixed(1)} <span className="text-sm text-profit-muted font-normal mx-1">até</span> {zones.buyRegion.max.toFixed(1)}
             </span>
          </div>
          <p className="text-xs text-profit-muted mt-2">
             Região de suporte técnico. Busque gatilhos de fluxo comprador aqui.
          </p>
          {isPriceInBuy && (
              <div className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
          )}
        </div>

        {/* VENDA */}
        <div className={`relative p-4 rounded-lg border-l-4 transition-all duration-300 ${isPriceInSell ? 'bg-red-900/20 border-profit-red shadow-[0_0_15px_rgba(247,90,104,0.1)]' : 'bg-[#1a1a1e] border-profit-red/40'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-profit-red font-bold uppercase text-sm">
                <TrendingDown className="w-4 h-4" /> Melhor Venda
            </div>
             <span className="text-[10px] text-profit-red border border-profit-red/30 px-1.5 py-0.5 rounded uppercase">
                Força: {zones.sellRegion.strength}
            </span>
          </div>
          
          <div className="flex items-end gap-3">
             <span className="text-2xl font-mono font-bold text-white">
                {zones.sellRegion.min.toFixed(1)} <span className="text-sm text-profit-muted font-normal mx-1">até</span> {zones.sellRegion.max.toFixed(1)}
             </span>
          </div>
          <p className="text-xs text-profit-muted mt-2">
             Região de resistência/exaustão. Busque absorção ou agressão vendedora.
          </p>
           {isPriceInSell && (
              <div className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RealTimeAnalysis;