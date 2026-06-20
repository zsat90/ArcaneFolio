export const COIN_VALUE_IN_DOLLARS = {
  CP: 0.01,
  SP: 0.1,
  EP: 0.5,
  GP: 1,
  PP: 10,
} as const;

export const COIN_FIELDS = ['GP', 'EP', 'SP', 'CP', 'PP'] as const;

export const SPENDABLE_COIN_FIELDS = ['GP', 'EP', 'SP', 'CP'] as const;

const COIN_VALUES_IN_CP: Record<(typeof COIN_FIELDS)[number], number> = {
  CP: 1,
  SP: 10,
  EP: 50,
  GP: 100,
  PP: 1000,
};

const parseCoinValue = (value?: string) => {
  if (!value) {
    return 0;
  }

  const parsed = Number(value.replace(/,/g, '').trim());

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

export const parseEquipmentCost = (cost: string) => {
  if (!cost || /[-–]/.test(cost)) {
    return null;
  }

  const match = cost.replace(/,/g, '').trim().match(/^(\d+)\s*(pp|gp|ep|sp|cp)\b/i);

  if (!match) {
    return null;
  }

  return Number(match[1]) * COIN_VALUES_IN_CP[match[2].toUpperCase() as keyof typeof COIN_VALUES_IN_CP];
};

export const getCoinTotalInCP = (equipmentDetails: Record<string, string>) => (
  COIN_FIELDS.reduce(
    (total, field) => total + (parseCoinValue(equipmentDetails[field]) * COIN_VALUES_IN_CP[field]),
    0,
  )
);

export const getSpendableCoinTotalInCP = (equipmentDetails: Record<string, string>) => (
  SPENDABLE_COIN_FIELDS.reduce(
    (total, field) => total + (parseCoinValue(equipmentDetails[field]) * COIN_VALUES_IN_CP[field]),
    0,
  )
);

export const coinTotalToFields = (totalCopper: number) => {
  let remaining = Math.max(Math.floor(totalCopper), 0);

  return COIN_FIELDS.reduce<Record<string, string>>((coins, field) => {
    const value = Math.floor(remaining / COIN_VALUES_IN_CP[field]);
    remaining %= COIN_VALUES_IN_CP[field];
    coins[field] = value ? String(value) : '';

    return coins;
  }, {});
};

export const spendableCoinTotalToFields = (totalCopper: number) => {
  let remaining = Math.max(Math.floor(totalCopper), 0);

  return SPENDABLE_COIN_FIELDS.reduce<Record<string, string>>((coins, field) => {
    const value = Math.floor(remaining / COIN_VALUES_IN_CP[field]);
    remaining %= COIN_VALUES_IN_CP[field];
    coins[field] = value ? String(value) : '';

    return coins;
  }, {});
};

export const deductEquipmentCost = (
  equipmentDetails: Record<string, string>,
  cost: string,
) => {
  const costInCP = parseEquipmentCost(cost);

  if (costInCP === null || costInCP <= 0) {
    return { equipmentDetails, deducted: false, insufficientFunds: false };
  }

  const spendableTotal = getSpendableCoinTotalInCP(equipmentDetails);

  if (spendableTotal < costInCP) {
    return { equipmentDetails, deducted: false, insufficientFunds: true };
  }

  return {
    equipmentDetails: {
      ...equipmentDetails,
      ...spendableCoinTotalToFields(spendableTotal - costInCP),
      PP: equipmentDetails.PP ?? '',
    },
    deducted: true,
    insufficientFunds: false,
  };
};
