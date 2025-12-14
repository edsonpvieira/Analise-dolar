import { MarketData, MarketBias, TradeSignal, SignalType, AssetType } from "../types";
import { ASSET_CONFIG } from "../constants";

// Helper to round to nearest tick
const roundTick = (val: number, tick: number = 0.5) => {
  return Math.round(val / tick) * tick;
};

export const generateMarketData = (prev: MarketData | null, asset: AssetType): MarketData => {
  if (!prev) {
    // Initial State
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
  const flowStrong = Math.abs(data.aggressionBuy - data.aggressionSell) > 10; // >10% diff

  if (data.price > data.vwap && data.aggressionBuy > 55) return MarketBias.BULLISH;
  if (data.price < data.vwap && data.aggressionSell > 55) return MarketBias.BEARISH;
  
  if (Math.abs(distToVwap) < 3) return MarketBias.NEUTRAL; // Too close to VWAP
  
  return MarketBias.NEUTRAL;
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