import React, { useState, useEffect } from 'react';
import { LiveSetupParams } from '../types';
import { RefreshCw, BarChart2, ExternalLink, Activity, Eye, EyeOff } from 'lucide-react';

interface Props {
  onAnalyze: (params: LiveSetupParams) => void;
}

const LiveMarketSetup: React.FC<Props> = ({ onAnalyze }) => {
  const [params, setParams] = useState<LiveSetupParams>({
    open: 0,
    high: 0,
    low: 0,
    vwap: 0,
    current: 0
  });

  const [showChart, setShowChart] = useState(true);

  // Initialize TradingView Widget
  useEffect(() => {
    if (showChart) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            "width": "100%",
            "height": 400,
            "symbol": "BMF:WDO1!",
            "interval": "5",
            "timezone": "America/Sao_Paulo",
            "theme": "dark",
            "style": "1",
            "locale": "br",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tradingview_chart",
            "hide_side_toolbar": false,
            "studies": [
              "VWAP@tv-basicstudies"
            ]
          });
        }
      };
      document.getElementById('tradingview_container')?.appendChild(script);
    }
  }, [showChart]);

  const handleChange = (field: keyof LiveSetupParams, value: string) => {
    setParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(params);
  };

  const openInvesting = () => {
    window.open('https://br.investing.com/currencies/usd-brl-mini-futures', 'InvestingWDO', 'width=1200,height=800');
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-profit-card border border-profit-border rounded-lg mb-8 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Activity className="w-6 h-6 text-profit-green animate-pulse" />
              <h2 className="text-xl font-bold text-white">SALA DE COMANDO</h2>
           </div>
           <p className="text-xs text-profit-muted">
             Visualize o gráfico real abaixo e insira os valores para o robô calcular as zonas de Fibonacci/Ptax.
           </p>
        </div>

        <div className="flex gap-2">
           <button 
             onClick={() => setShowChart(!showChart)}
             className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-[#323238] hover:bg-[#404046] rounded text-white transition-all"
           >
             {showChart ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             {showChart ? 'OCULTAR GRÁFICO' : 'VER GRÁFICO WDO'}
           </button>
           <button 
             onClick={openInvesting}
             className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded text-white transition-all"
           >
             <ExternalLink className="w-4 h-4" />
             ABRIR INVESTING.COM
           </button>
        </div>
      </div>

      {/* Chart Container */}
      {showChart && (
        <div className="p-6">
           <div id="tradingview_container" className="w-full h-[400px] border border-profit-border rounded overflow-hidden relative bg-black">
              <div id="tradingview_chart" className="w-full h-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-profit-muted text-xs -z-10">
                 Carregando Gráfico BMF:WDO1!...
              </div>
           </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-6 bg-[#18181b] border-t border-profit-border">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-[10px] text-blue-300 font-bold mb-1 uppercase tracking-wider">Abertura</label>
            <input 
              type="number" step="0.5" placeholder="0.0"
              value={params.open || ''}
              onChange={(e) => handleChange('open', e.target.value)}
              className="w-full bg-[#09090b] border border-profit-border text-white font-mono text-lg p-2 rounded focus:border-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-[10px] text-green-400 font-bold mb-1 uppercase tracking-wider">Máxima</label>
            <input 
              type="number" step="0.5" placeholder="0.0"
              value={params.high || ''}
              onChange={(e) => handleChange('high', e.target.value)}
              className="w-full bg-[#09090b] border border-profit-border text-white font-mono text-lg p-2 rounded focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-red-400 font-bold mb-1 uppercase tracking-wider">Mínima</label>
            <input 
              type="number" step="0.5" placeholder="0.0"
              value={params.low || ''}
              onChange={(e) => handleChange('low', e.target.value)}
              className="w-full bg-[#09090b] border border-profit-border text-white font-mono text-lg p-2 rounded focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-wider">VWAP (Do Gráfico)</label>
            <input 
              type="number" step="0.5" placeholder="0.0"
              value={params.vwap || ''}
              onChange={(e) => handleChange('vwap', e.target.value)}
              className="w-full bg-[#09090b] border border-purple-500/50 text-white font-mono text-lg p-2 rounded focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-yellow-400 font-bold mb-1 uppercase tracking-wider">Preço Atual</label>
            <input 
              type="number" step="0.5" placeholder="0.0"
              value={params.current || ''}
              onChange={(e) => handleChange('current', e.target.value)}
              className="w-full bg-[#09090b] border border-profit-border text-white font-mono text-lg p-2 rounded focus:border-yellow-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            className="h-[46px] bg-profit-green hover:bg-green-600 text-white font-bold rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,179,126,0.3)] hover:shadow-[0_0_30px_rgba(0,179,126,0.5)]"
          >
            <BarChart2 className="w-5 h-5" />
            CALCULAR ZONAS
          </button>
        </form>
        
        <div className="mt-4 flex flex-col md:flex-row gap-2 md:gap-6 text-[10px] text-profit-muted opacity-80">
           <span className="flex items-center gap-1">ℹ️ Olhe o gráfico acima e preencha os campos.</span>
           <span className="flex items-center gap-1">⚠️ Devido a segurança do navegador, o preenchimento deve ser manual.</span>
        </div>
      </div>
    </div>
  );
};

// Declare definition for TS to accept window.TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

export default LiveMarketSetup;