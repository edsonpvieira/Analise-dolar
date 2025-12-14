import { AssetType, PtaxZone } from './types';

export const ASSET_CONFIG = {
  [AssetType.WDO]: {
    tickSize: 0.5,
    valuePerPoint: 10, // R$ 10 per contract per point
    name: 'Mini Dólar'
  },
  [AssetType.DOL]: {
    tickSize: 0.5,
    valuePerPoint: 50, // R$ 50 per contract per point
    name: 'Dólar Cheio'
  }
};

export const INITIAL_SETTINGS = {
  asset: AssetType.WDO,
  contracts: 1,
  capital: 5000,
  maxRiskPerTrade: 150,
  maxDailyLoss: 500,
  startTime: '09:00',
  endTime: '17:00'
};

export const MOCK_PTAX_ZONES: PtaxZone[] = [
  { price: 0, type: 'ATTRACTION', probability: 'HIGH', timeLabel: 'PTAX 10:00' },
  { price: 0, type: 'NEUTRAL', probability: 'MEDIUM', timeLabel: 'PTAX 11:00' },
  { price: 0, type: 'DEFENSE', probability: 'HIGH', timeLabel: 'PTAX 12:00' },
];