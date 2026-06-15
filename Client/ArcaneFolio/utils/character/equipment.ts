export const getEquipmentLinesForCategory = (
  equipmentDetails: Record<string, string>,
  category: string,
) => {
  return Array.from(new Set(
    (equipmentDetails.Armor ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.endsWith(` - ${category}`)),
  ));
};

export const withSelectedEquipmentOption = (options: string[], selected?: string) => {
  const selectedValue = selected?.trim();

  if (selectedValue && !options.includes(selectedValue)) {
    return [...options, selectedValue];
  }

  return options;
};
