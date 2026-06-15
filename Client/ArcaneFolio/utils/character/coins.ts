export const COIN_FIELDS = ['PP', 'GP', 'EP', 'SP', 'CP'];

const COIN_VALUES_IN_CP: Record<string, number> = {
  PP: 1000,
  GP: 100,
  EP: 50,
  SP: 10,
  CP: 1,
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

  return Number(match[1]) * COIN_VALUES_IN_CP[match[2].toUpperCase()];
};

export const getCoinTotalInCP = (equipmentDetails: Record<string, string>) => {
  return COIN_FIELDS.reduce((total, field) => total + (parseCoinValue(equipmentDetails[field]) * COIN_VALUES_IN_CP[field]), 0);
};

export const coinTotalToFields = (totalCopper: number) => {
  let remaining = Math.max(Math.floor(totalCopper), 0);

  return COIN_FIELDS.reduce<Record<string, string>>((coins, field) => {
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

  const total = getCoinTotalInCP(equipmentDetails);

  if (total < costInCP) {
    return { equipmentDetails, deducted: false, insufficientFunds: true };
  }

  return {
    equipmentDetails: {
      ...equipmentDetails,
      ...coinTotalToFields(total - costInCP),
    },
    deducted: true,
    insufficientFunds: false,
  };
};
