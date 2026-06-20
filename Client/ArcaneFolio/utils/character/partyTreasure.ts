import { COIN_FIELDS, COIN_VALUE_IN_DOLLARS } from './coins';

export const PARTY_TREASURE_COIN_FIELDS = COIN_FIELDS;

export const createEmptyPartyTreasureCoins = () => (
  COIN_FIELDS.reduce<Record<string, string>>((coins, field) => {
    coins[field] = '';

    return coins;
  }, {})
);

export const getStoredCoinAmount = (value?: string) => {
  if (!value?.trim()) {
    return 0;
  }

  const parsed = Number(value.replace(/,/g, '').trim());

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

export const parseCoinEntry = (value: string) => {
  const trimmed = value.replace(/,/g, '').trim();

  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return 0;
  }

  return Number(trimmed);
};

export const adjustPartyCoinTotal = (current: string | undefined, delta: number) => {
  const next = Math.max(0, getStoredCoinAmount(current) + delta);

  return next > 0 ? String(next) : '';
};

export const getPartyTreasureCombinedValue = (partyTreasureCoins: Record<string, string>) => (
  COIN_FIELDS.reduce((total, field) => (
    total + (getStoredCoinAmount(partyTreasureCoins[field]) * COIN_VALUE_IN_DOLLARS[field])
  ), 0)
);

export const formatCurrency = (value: number) => (
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
);
