import { MarketData, MarketBias, TradeSignal, SignalType, AssetType, TradingZones, LiveSetupParams } from "../types";
import { ASSET_CONFIG } from "../constants";

// Helper to round to nearest tick
const roundTick = (val: number, tick: number = 0.5) => {
  return Math.round(val / tick) * tick;
};

export const generateMarketData = (prev: MarketData | null, asset: AssetType, manualOverride?: LiveSetupParams): MarketData => {
  if (manualOverride) {
      // If manual params exist, generate noise around the current manual price
      const basePrice = manualOverride.current;
      const noise = (Math.random() - 0.5) * 3; // Small fluctuation
      return {
          price: roundTick(basePrice + noise),
          open: manualOverride.open,
          high: Math.max(manualOverride.high, basePrice + noise),
          low: Math.min(manualOverride.low, basePrice + noise),
          vwap: manualOverride.vwap,
          volume: prev ? prev.volume + 100 : 5000,
          aggressionBuy: 50 + (Math.random() * 10 - 5),
          aggressionSell: 50 + (Math.random() * 10 - 5),
          lastUpdate: Date.now()
      };
  }

  if (!prev) {
    // Initial State (Simulation Default)
    const startPrice = asset === AssetType.WDO ? 5000 : 5000; 
    return {
      price: startPrice,
      open: startPrice,
      high: startPrice + 10,
      low: startPrice - 10,
      vwap: startPrice,
      volume: 1000,
      aggressionBuy: 50,
      aggressionSell: 50,
      lastUpdate: Date.now()
    };
  }

  // Simulate movement
  const change = (Math.random() - 0.5) * 2; // -1 to +1 points
  const newPrice = roundTick(prev.price + change);
  
  // Update High/Low
  const newHigh = Math.max(prev.high, newPrice);
  const newLow = Math.min(prev.low, newPrice);

  // Update VWAP (simplified moving average for sim)
  const newVwap = roundTick((prev.vwap * 0.95) + (newPrice * 0.05));

  // Simulate Aggression Flow based on price direction relative to VWAP
  let newAggBuy = prev.aggressionBuy;
  if (newPrice > prev.price) {
     newAggBuy = Math.min(90, prev.aggressionBuy + Math.random() * 5);
  } else {
     newAggBuy = Math.max(10, prev.aggressionBuy - Math.random() * 5);
  }

  return {
    price: newPrice,
    open: prev.open,
    high: newHigh,
    low: newLow,
    vwap: newVwap,
    volume: prev.volume + Math.floor(Math.random() * 50),
    aggressionBuy: Math.round(newAggBuy),
    aggressionSell: 100 - Math.round(newAggBuy),
    lastUpdate: Date.now()
  };
};

export const calculateBias = (data: MarketData): MarketBias => {
  const distToVwap = data.price - data.vwap;
  
  // Strong Trend conditions
  if (data.price > data.vwap && data.price > data.open) return MarketBias.BULLISH;
  if (data.price < data.vwap && data.price < data.open) return MarketBias.BEARISH;
  
  if (Math.abs(distToVwap) < 3) return MarketBias.NEUTRAL; // Too close to VWAP
  
  return MarketBias.NEUTRAL;
};

// New Professional Calculation based on Manual Inputs
export const calculateProZones = (params: LiveSetupParams): TradingZones => {
    const { open, high, low, vwap, current } = params;
    
    const range = high - low;
    const fib38 = range * 0.382;
    const fib61 = range * 0.618;

    let buyRegion, sellRegion, context;

    // Analyze Context relative to VWAP and Open (The "Power Zone")
    const isBullish = current > vwap;
    
    if (isBullish) {
        // UPTREND SCENARIO
        // Buy Zone: The Pullback to VWAP or Fib 38% from High
        buyRegion = { 
            min: vwap - 2, 
            max: vwap + 2, 
            strength: 'ALTA' 
        };
        // Sell Zone: Resistance at High or Expansion
        sellRegion = { 
            min: high - 2, 
            max: high + 5, 
            strength: 'MÉDIA' 
        };
        context = "Cenário Comprador: Preço acima da VWAP. Aguarde Pullback para comprar.";

        if (current > high) {
             context = "Rompimento de Máxima: Cuidado com compras esticadas. Espere teste no topo anterior.";
             buyRegion = { min: high - 2, max: high, strength: 'MÉDIA' };
             sellRegion = { min: high + fib38, max: high + fib61, strength: 'BAIXA' }; // Counter trend
        }

    } else {
        // DOWNTREND SCENARIO
        // Sell Zone: The Pullback to VWAP
        sellRegion = { 
            min: vwap - 2, 
            max: vwap + 2, 
            strength: 'ALTA' 
        };
        // Buy Zone: Support at Low
        buyRegion = { 
            min: low - 5, 
            max: low + 2, 
            strength: 'MÉDIA' 
        };
        context = "Cenário Vendedor: Preço abaixo da VWAP. Venda repiques.";
        
        if (current < low) {
            context = "Rompimento de Mínima: Tendência forte. Não compre contra o fluxo.";
            sellRegion = { min: low, max: low + 2, strength: 'MÉDIA' };
            buyRegion = { min: low - fib61, max: low - fib38, strength: 'BAIXA' }; // Counter trend
       }
    }

    // Adjust for Consolidation (Inside Opening Range)
    if (current > low && current < high && range < 20) {
        context = "Consolidação Estreita (Range < 20pts). Opere apenas extremos.";
        buyRegion = { min: low, max: low + 3, strength: 'ALTA' };
        sellRegion = { min: high - 3, max: high, strength: 'ALTA' };
    }

    return { buyRegion, sellRegion, trendContext: context };
};

export const calculateTradingZones = (data: MarketData, bias: MarketBias): TradingZones => {
  // Fallback for simulation mode only
  let buyRegion, sellRegion, context;

  if (bias === MarketBias.BULLISH) {
    buyRegion = { min: data.vwap - 2, max: data.vwap + 2, strength: 'ALTA' as const };
    sellRegion = { min: data.high, max: data.high + 5, strength: 'MÉDIA' as const };
    context = "Tendência de Alta - Priorize Pullbacks na VWAP";
  } else if (bias === MarketBias.BEARISH) {
    sellRegion = { min: data.vwap - 2, max: data.vwap + 2, strength: 'ALTA' as const };
    buyRegion = { min: data.low - 5, max: data.low, strength: 'MÉDIA' as const };
    context = "Tendência de Baixa - Venda repiques na VWAP";
  } else {
    buyRegion = { min: data.low, max: data.low + 3, strength: 'MÉDIA' as const };
    sellRegion = { min: data.high - 3, max: data.high, strength: 'MÉDIA' as const };
    context = "Mercado Lateral - Operar Extremos";
  }

  return { buyRegion, sellRegion, trendContext: context };
};

export const generateSignal = (
  data: MarketData, 
  bias: MarketBias, 
  riskPerTrade: number, 
  contracts: number,
  asset: AssetType
): TradeSignal | null => {
  
  // Only generate signals occasionally for demo
  if (Math.random() > 0.1) return null; 

  const valPerPoint = ASSET_CONFIG[asset].valuePerPoint * contracts;
  
  // Logic: Trend Following
  if (bias === MarketBias.BULLISH) {
    // Pullback to VWAP buy
    const stopPoints = 5; 
    const targetPoints = 10;
    
    // Check if stop is within risk
    const financialRisk = stopPoints * valPerPoint;
    if (financialRisk > riskPerTrade) return null; // Filter by risk

    return {
      type: SignalType.BUY,
      entryPrice: data.price,
      stopLoss: data.price - stopPoints,
      target1: data.price + (targetPoints * 0.5),
      targetFinal: data.price + targetPoints,
      riskRewardRatio: targetPoints / stopPoints,
      reason: "Fluxo comprador forte acima da VWAP. Pullback identificado.",
      timestamp: Date.now()
    };
  } else if (bias === MarketBias.BEARISH) {
    const stopPoints = 5;
    const targetPoints = 10;

    const financialRisk = stopPoints * valPerPoint;
    if (financialRisk > riskPerTrade) return null;

    return {
      type: SignalType.SELL,
      entryPrice: data.price,
      stopLoss: data.price + stopPoints,
      target1: data.price - (targetPoints * 0.5),
      targetFinal: data.price - targetPoints,
      riskRewardRatio: targetPoints / stopPoints,
      reason: "Perda da VWAP com agressão vendedora. Estrutura de baixa.",
      timestamp: Date.now()
    };
  }

  return null;
};