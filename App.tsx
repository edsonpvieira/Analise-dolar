import React, { useState, useEffect, useCallback } from 'react';
import { 
  MarketData, 
  MarketBias, 
  TradeSignal, 
  PtaxZone, 
  RiskStatus, 
  UserSettings,
  TradingZones,
  LiveSetupParams
} from './types';
import { 
  INITIAL_SETTINGS, 
  MOCK_PTAX_ZONES 
} from './constants';
import { 
  generateMarketData, 
  calculateBias, 
  generateSignal,
  calculateTradingZones,
  calculateProZones
} from './services/marketSimulator';
import { getAnalystInsight } from './services/geminiService';

import MarketOverview from './components/MarketOverview';
import SignalCard from './components/SignalCard';
import RiskMonitor from './components/RiskMonitor';
import PtaxPanel from './components/PtaxPanel';
import SettingsPanel from './components/SettingsPanel';
import ChartUploadPanel from './components/ChartUploadPanel';
import RealTimeAnalysis from './components/RealTimeAnalysis';
import RealTimeChart from './components/RealTimeChart';
import LiveMarketSetup from './components/LiveMarketSetup'; // New import
import { BrainCircuit, Play, Square, Info } from 'lucide-react';

// Helper for time formatting
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const App: React.FC = () => {
  // State
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [priceHistory, setPriceHistory] = useState<{time: string, price: number}[]>([]); 
  const [bias, setBias] = useState<MarketBias>(MarketBias.NEUTRAL);
  const [signal, setSignal] = useState<TradeSignal | null>(null);
  const [ptaxZones, setPtaxZones] = useState<PtaxZone[]>(MOCK_PTAX_ZONES);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [tradingZones, setTradingZones] = useState<TradingZones | null>(null);
  const [liveParams, setLiveParams] = useState<LiveSetupParams | null>(null); // State for manual inputs
  
  const [riskStatus, setRiskStatus] = useState<RiskStatus>({
    currentPnL: 0,
    tradesCount: 0,
    isBlocked: false,
    maxLossHit: false
  });

  const [isRunning, setIsRunning] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initialize Data on Mount
  useEffect(() => {
    const initialData = generateMarketData(null, settings.asset);
    setMarketData(initialData);
    setPriceHistory([{ time: formatTime(new Date()), price: initialData.price }]); 
    setTradingZones(calculateTradingZones(initialData, MarketBias.NEUTRAL));
    
    const base = initialData.price;
    setPtaxZones([
        { price: base + 15, type: 'DEFENSE', probability: 'HIGH', timeLabel: 'PTAX 10:00' },
        { price: base - 10, type: 'ATTRACTION', probability: 'MEDIUM', timeLabel: 'Prévia 1' },
        { price: base - 25, type: 'NEUTRAL', probability: 'LOW', timeLabel: 'Abertura' },
    ]);
  }, [settings.asset]);

  // Handle Manual Live Data Analysis
  const handleLiveAnalysis = (params: LiveSetupParams) => {
      setLiveParams(params);
      
      // Force update market data to match manual input immediately
      const newData: MarketData = {
          price: params.current,
          open: params.open,
          high: params.high,
          low: params.low,
          vwap: params.vwap,
          volume: 10000,
          aggressionBuy: params.current > params.vwap ? 60 : 40,
          aggressionSell: params.current < params.vwap ? 60 : 40,
          lastUpdate: Date.now()
      };
      
      setMarketData(newData);
      
      // Use Pro Zones calculation
      const newZones = calculateProZones(params);
      setTradingZones(newZones);
      setBias(params.current > params.vwap ? MarketBias.BULLISH : MarketBias.BEARISH);
      
      // Add to history
      setPriceHistory(prev => [...prev, { time: formatTime(new Date()), price: params.current }].slice(-30));
      
      // Start simulation around these points
      setIsRunning(true);
  };

  // Main Simulation Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning && !riskStatus.isBlocked) {
      interval = setInterval(() => {
        setMarketData(prev => {
          if (!prev) return null;
          
          // If we have live params, generate data AROUND those params (Simulated Reality)
          const newData = generateMarketData(prev, settings.asset, liveParams || undefined);
          
          // Update Bias
          const newBias = calculateBias(newData);
          setBias(newBias);

          // Update Trading Zones (Keep zones fixed if manual, or dynamic if auto)
          if (!liveParams) {
             setTradingZones(calculateTradingZones(newData, newBias));
          }

          // Update History
          setPriceHistory(prevHist => {
             const newHist = [...prevHist, { time: formatTime(new Date()), price: newData.price }];
             if (newHist.length > 50) return newHist.slice(1); 
             return newHist;
          });

          // Generate Signal logic...
          if (!signal) {
             const newSignal = generateSignal(newData, newBias, settings.maxRiskPerTrade, settings.contracts, settings.asset);
             if (newSignal) setSignal(newSignal);
          } else {
             if (newData.price >= signal.targetFinal || newData.price <= signal.stopLoss) {
                setSignal(null);
             }
          }

          return newData;
        });
      }, 1500); 
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, settings, signal, riskStatus.isBlocked, liveParams]);

  // Check Risk
  useEffect(() => {
     if (riskStatus.currentPnL <= -settings.maxDailyLoss) {
         setRiskStatus(prev => ({ ...prev, isBlocked: true, maxLossHit: true }));
         setIsRunning(false);
     }
  }, [riskStatus.currentPnL, settings.maxDailyLoss]);

  const handleAiAnalysis = async () => {
    if (!marketData) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await getAnalystInsight(marketData, bias, ptaxZones);
        setAiInsight(insight);
    } catch (e) {
        setAiInsight("Erro ao analisar.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const toggleSimulation = () => {
      setIsRunning(!isRunning);
  };

  if (!marketData) return <div className="text-white flex h-screen items-center justify-center">Iniciando sistema...</div>;

  return (
    <div className="min-h-screen bg-profit-bg text-profit-text p-4 md:p-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-profit-border pb-4">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-3 h-3 bg-profit-green rounded-full animate-pulse"></div>
            TradeCopilot <span className="text-profit-green">PRO</span>
          </h1>
          <p className="text-sm text-profit-muted">Analista de Fluxo & Risco para WDO/DOL</p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={toggleSimulation}
                className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-all ${isRunning ? 'bg-profit-red hover:bg-red-700' : 'bg-profit-green hover:bg-green-700'}`}
            >
                {isRunning ? <><Square className="w-4 h-4 fill-current" /> PAUSAR FLUXO</> : <><Play className="w-4 h-4 fill-current" /> SIMULAR MERCADO</>}
            </button>
        </div>
      </header>

      {/* NEW: Live Market Setup Area */}
      <LiveMarketSetup onAnalyze={handleLiveAnalysis} />

      {/* Main Grid */}
      <MarketOverview data={marketData} bias={bias} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Signals & Analysis */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Real Time Analysis & Chart */}
            <div className="flex flex-col gap-6">
               {tradingZones && (
                   <>
                      <RealTimeAnalysis zones={tradingZones} currentPrice={marketData.price} />
                      <RealTimeChart data={priceHistory} zones={tradingZones} currentData={marketData} />
                   </>
               )}
            </div>

            <SignalCard 
                signal={signal} 
                isBlocked={riskStatus.isBlocked} 
                asset={settings.asset}
                contracts={settings.contracts}
            />

            <ChartUploadPanel />

            {/* AI Insight Section */}
            <div className="bg-profit-card border border-profit-border p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-profit-muted text-sm font-bold uppercase flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-500" /> Analista IA (Gemini)
                    </h3>
                    <button 
                        onClick={handleAiAnalysis}
                        disabled={isAiLoading || !process.env.API_KEY}
                        className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-3 py-1 rounded text-white transition-colors"
                    >
                        {isAiLoading ? "Analisando..." : "Gerar Relatório de Contexto"}
                    </button>
                </div>
                
                {aiInsight ? (
                    <div className="bg-[#1a1a1e] p-4 rounded border border-purple-500/30 text-sm leading-relaxed whitespace-pre-line animate-in fade-in">
                        {aiInsight}
                    </div>
                ) : (
                    <div className="text-center py-8 text-profit-muted text-sm border-2 border-dashed border-profit-border rounded">
                         {!process.env.API_KEY 
                           ? "Configure a API Key no código para ativar a IA."
                           : "Clique em 'Gerar Relatório' para uma análise psicológica e técnica do mercado atual."}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Risk, PTAX, Settings */}
        <div className="space-y-6">
            <RiskMonitor riskStatus={riskStatus} settings={settings} />
            <PtaxPanel zones={ptaxZones} currentPrice={marketData.price} />
            <SettingsPanel settings={settings} onUpdate={setSettings} />
            
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex gap-3">
               <Info className="w-5 h-5 text-blue-400 shrink-0" />
               <p className="text-xs text-blue-200">
                  <strong>Aviso Legal:</strong> Este app é um simulador educacional. Não execute ordens reais baseadas apenas nestes sinais. O mercado de futuros envolve alto risco.
               </p>
            </div>
        </div>

      </div>

    </div>
  );
};

export default App;