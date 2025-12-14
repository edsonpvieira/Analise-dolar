import React from 'react';
import { MarketData, MarketBias } from '../types';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart2 } from 'lucide-react';

interface Props {
  data: MarketData;
  bias: MarketBias;
}

const MarketOverview: React.FC<Props> = ({ data, bias }) => {
  const getBiasColor = (b: MarketBias) => {
    switch (b) {
      case MarketBias.BULLISH: return 'text-profit-green';
      case MarketBias.BEARISH: return 'text-profit-red';
      default: return 'text-profit-yellow';
    }
  };

  const getBiasIcon = (b: MarketBias) => {
    switch (b) {
      case MarketBias.BULLISH: return <TrendingUp className="w-8 h-8 text-profit-green" />;
      case MarketBias.BEARISH: return <TrendingDown className="w-8 h-8 text-profit-red" />;
      default: return <Minus className="w-8 h-8 text-profit-yellow" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Price Card */}
      <div className="bg-profit-card p-6 rounded-lg border border-profit-border flex flex-col justify-between">
        <span className="text-profit-muted text-sm font-semibold uppercase">Último Preço</span>
        <div className="flex items-end justify-between mt-2">
          <span className="text-4xl font-bold text-profit-text">{data.price.toFixed(1)}</span>
          <span className={`text-sm ${data.price > data.open ? 'text-profit-green' : 'text-profit-red'}`}>
            {(data.price - data.open).toFixed(1)} pts
          </span>
        </div>
        <div className="w-full bg-gray-700 h-1 mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((data.price - data.low) / (data.high - data.low || 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-profit-muted mt-1">
          <span>Min: {data.low}</span>
          <span>Max: {data.high}</span>
        </div>
      </div>

      {/* Bias Card */}
      <div className="bg-profit-card p-6 rounded-lg border border-profit-border flex flex-col justify-between">
        <span className="text-profit-muted text-sm font-semibold uppercase">Direção do Mercado</span>
        <div className="flex items-center gap-4 mt-2">
          {getBiasIcon(bias)}
          <div>
            <span className={`text-2xl font-bold ${getBiasColor(bias)}`}>{bias}</span>
            <p className="text-xs text-profit-muted mt-1">Baseado em VWAP e Fluxo</p>
          </div>
        </div>
      </div>

      {/* Flow Card */}
      <div className="bg-profit-card p-6 rounded-lg border border-profit-border flex flex-col justify-between">
         <span className="text-profit-muted text-sm font-semibold uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" /> Fluxo de Agressão
         </span>
         <div className="mt-4">
            <div className="flex justify-between text-sm mb-1 font-bold">
                <span className="text-profit-green">{data.aggressionBuy}% Compra</span>
                <span className="text-profit-red">{data.aggressionSell}% Venda</span>
            </div>
            <div className="flex w-full h-3 rounded-full overflow-hidden">
                <div className="bg-profit-green transition-all duration-300" style={{ width: `${data.aggressionBuy}%` }}></div>
                <div className="bg-profit-red transition-all duration-300" style={{ width: `${data.aggressionSell}%` }}></div>
            </div>
         </div>
      </div>

      {/* VWAP Card */}
      <div className="bg-profit-card p-6 rounded-lg border border-profit-border flex flex-col justify-between">
        <span className="text-profit-muted text-sm font-semibold uppercase flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> VWAP
        </span>
        <div className="mt-2">
            <span className="text-3xl font-bold text-purple-400">{data.vwap.toFixed(1)}</span>
            <p className="text-xs text-profit-muted mt-2">
                Preço está {data.price > data.vwap ? 'ACIMA' : 'ABAIXO'} da média ponderada
            </p>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;