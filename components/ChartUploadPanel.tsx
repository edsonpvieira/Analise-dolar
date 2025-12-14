import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Search, X } from 'lucide-react';
import { analyzeChartImages } from '../services/geminiService';

const ChartUploadPanel: React.FC = () => {
  const [dailyChart, setDailyChart] = useState<string | null>(null);
  const [intradayChart, setIntradayChart] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Refs for hidden file inputs
  const dailyInputRef = useRef<HTMLInputElement>(null);
  const intradayInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFunc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!dailyChart && !intradayChart) return;
    
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeChartImages(dailyChart, intradayChart);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Erro ao analisar gráficos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-profit-card border border-profit-border p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-profit-muted text-sm font-bold uppercase flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-profit-yellow" /> Análise de Contexto (Gráficos)
        </h3>
        {analysis && (
          <button 
            onClick={() => setAnalysis(null)} 
            className="text-xs text-profit-muted hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Daily Chart Input */}
        <div 
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer h-32 ${dailyChart ? 'border-profit-green bg-green-900/10' : 'border-profit-border hover:border-profit-muted'}`}
          onClick={() => dailyInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            ref={dailyInputRef} 
            className="hidden" 
            onChange={(e) => handleFileChange(e, setDailyChart)} 
          />
          {dailyChart ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={dailyChart} alt="Daily" className="max-h-full max-w-full object-contain opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Diário Carregado</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-profit-muted mb-2" />
              <span className="text-xs text-profit-muted font-bold">Gráfico Diário (D1)</span>
              <span className="text-[10px] text-profit-muted mt-1">Upload Print</span>
            </>
          )}
        </div>

        {/* Intraday Chart Input */}
        <div 
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer h-32 ${intradayChart ? 'border-profit-green bg-green-900/10' : 'border-profit-border hover:border-profit-muted'}`}
          onClick={() => intradayInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            ref={intradayInputRef} 
            className="hidden" 
            onChange={(e) => handleFileChange(e, setIntradayChart)} 
          />
          {intradayChart ? (
            <div className="relative w-full h-full flex items-center justify-center">
               <img src={intradayChart} alt="Intraday" className="max-h-full max-w-full object-contain opacity-50" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Intraday Carregado</span>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-profit-muted mb-2" />
              <span className="text-xs text-profit-muted font-bold">Tempo Menor (5m/15m)</span>
              <span className="text-[10px] text-profit-muted mt-1">Upload Print</span>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleAnalyze}
        disabled={loading || (!dailyChart && !intradayChart) || !process.env.API_KEY}
        className="w-full bg-profit-card border border-profit-border hover:bg-[#2a2a30] text-white py-3 rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
      >
        {loading ? (
          <span className="animate-pulse">Analisando Posicionamento...</span>
        ) : (
          <>
            <Search className="w-4 h-4" /> LOCALIZAR MÉDIO DOS PLAYERS
          </>
        )}
      </button>

      {!process.env.API_KEY && (
         <div className="text-center text-xs text-profit-red mb-4">
             ⚠️ API Key necessária para análise de imagens.
         </div>
      )}

      {/* Result Area */}
      {analysis && (
        <div className="bg-[#1a1a1e] p-4 rounded border border-profit-yellow/30 animate-in fade-in slide-in-from-top-2">
           <h4 className="text-profit-yellow text-xs font-bold uppercase mb-3 border-b border-profit-border pb-2">
             Análise de Estrutura & Players
           </h4>
           <div className="text-sm text-profit-text leading-relaxed whitespace-pre-line">
             {analysis}
           </div>
        </div>
      )}
    </div>
  );
};

export default ChartUploadPanel;