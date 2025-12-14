export enum AssetType {
  WDO = 'WDO',
  DOL = 'DOL'
}

export enum MarketBias {
  BULLISH = 'ALTA',
  BEARISH = 'BAIXA',
  NEUTRAL = 'LATERAL'
}

export enum SignalType {
  BUY = 'COMPRA',
  SELL = 'VENDA',
  WAIT = 'AGUARDAR'
}

export interface UserSettings {
  asset: AssetType;
  contracts: number;
  capital: number;
  maxRiskPerTrade: number; // In currency
  maxDailyLoss: number; // In currency
  startTime: string;
  endTime: string;
  apiKey?: string; // For Gemini
}

export interface MarketData {
  price: number;
  open: number;
  high: number;
  low: number;
  vwap: number;
  volume: number;
  aggressionBuy: number; // Percentage 0-100
  aggressionSell: number; // Percentage 0-100
  lastUpdate: number;
}

export interface TradeSignal {
  type: SignalType;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  targetFinal: number;
  riskRewardRatio: number;
  reason: string;
  timestamp: number;
}

export interface PtaxZone {
  price: number;
  type: 'ATTRACTION' | 'DEFENSE' | 'NEUTRAL';
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  timeLabel: string; // e.g., "10:00", "Previa 1"
}

export interface RiskStatus {
  currentPnL: number;
  tradesCount: number;
  isBlocked: boolean;
  maxLossHit: boolean;
}

export interface TradingZones {
  buyRegion: { min: number; max: number; strength: 'ALTA' | 'MÉDIA' | 'BAIXA' };
  sellRegion: { min: number; max: number; strength: 'ALTA' | 'MÉDIA' | 'BAIXA' };
  trendContext: string;
}