import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { TradingZones, MarketData } from '../types';
import { Activity } from 'lucide-react';

interface PricePoint {
  time: string;
  price: number;
}

interface Props {
  data: PricePoint[];
  zones: TradingZones | null;
  currentData: MarketData;
}

const RealTimeChart: React.FC<Props> = ({ data, zones, currentData }) => {
  if (!data || data.length === 0) return null;

  // Calculate domain to keep chart focused but inclusive of zones
  const prices = data.map(d => d.price);
  let minDomain = Math.min(...prices);
  let maxDomain = Math.max(...prices);

  if (zones) {
    minDomain = Math.min(minDomain, zones.buyRegion.min);
    maxDomain = Math.max(maxDomain, zones.sellRegion.max);
  }

  const padding = 5; // buffer points

  return (
    <div className="bg-profit-card border border-profit-border p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-profit-muted text-sm font-bold uppercase flex items-center gap-2">
          <Activity className="w-4 h-4 text-profit-yellow" /> Gráfico Tempo Real (1m)
        </h3>
        <div className="flex gap-4 text-xs font-mono">
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-profit-green/50"></span>
                <span className="text-profit-muted">Zona Compra</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-profit-red/50"></span>
                <span className="text-profit-muted">Zona Venda</span>
            </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#323238" vertical={false} />
            <XAxis 
                dataKey="time" 
                stroke="#8D8D99" 
                tick={{fontSize: 10}} 
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                domain={[minDomain - padding, maxDomain + padding]} 
                stroke="#8D8D99" 
                tick={{fontSize: 10}}
                tickFormatter={(val) => val.toFixed(1)}
                tickLine={false}
                axisLine={false}
                width={40}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#202024', borderColor: '#323238', color: '#E1E1E6' }}
                itemStyle={{ color: '#E1E1E6' }}
                labelStyle={{ color: '#8D8D99' }}
            />
            
            {/* BUY ZONE */}
            {zones && (
                <ReferenceArea 
                    y1={zones.buyRegion.min} 
                    y2={zones.buyRegion.max} 
                    fill="#00B37E" 
                    fillOpacity={0.15} 
                    stroke="#00B37E"
                    strokeDasharray="3 3"
                    strokeOpacity={0.3}
                />
            )}

            {/* SELL ZONE */}
            {zones && (
                <ReferenceArea 
                    y1={zones.sellRegion.min} 
                    y2={zones.sellRegion.max} 
                    fill="#F75A68" 
                    fillOpacity={0.15}
                    stroke="#F75A68"
                    strokeDasharray="3 3"
                    strokeOpacity={0.3}
                />
            )}

            {/* VWAP Line */}
            <ReferenceLine y={currentData.vwap} stroke="#A855F7" strokeDasharray="5 5" label={{ value: 'VWAP', fill: '#A855F7', fontSize: 10, position: 'right' }} />

            <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#E1E1E6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealTimeChart;